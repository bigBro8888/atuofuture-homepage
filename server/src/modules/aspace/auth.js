import jwt from 'jsonwebtoken'
import { config } from '../../config.js'
import { db } from '../../lib/store.js'

const cookieName = 'aso_portal_session'

export function publicPortalUser(user) {
  const { passwordHash, organizationIds = [], ...safe } = user
  const organizations = db().aspaceOrganizations
    .filter((organization) => organizationIds.includes(organization.id))
    .map((organization) => ({ ...organization }))
  const activeOrganization = organizations.find((item) => item.id === user.activeOrganizationId)
    || organizations[0]
    || null
  return { ...safe, activeOrganizationId: activeOrganization?.id || '', activeOrganization, organizations }
}

export function createPortalSession(user) {
  return jwt.sign(
    { sub: user.id },
    config.jwtSecret,
    { expiresIn: '12h', issuer: 'aspace-one' },
  )
}

export function portalSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000,
    path: '/',
  }
}

export function requirePortalAuth(request, response, next) {
  try {
    const token = request.cookies?.[cookieName]
    if (!token) return response.status(401).json({ error: 'authentication_required' })
    const payload = jwt.verify(token, config.jwtSecret, { issuer: 'aspace-one' })
    const user = db().aspaceUsers.find((item) => item.id === payload.sub && item.enabled)
    if (!user) return response.status(401).json({ error: 'invalid_session' })
    request.portalUserRecord = user
    request.portalUser = publicPortalUser(user)
    next()
  } catch {
    response.status(401).json({ error: 'invalid_session' })
  }
}

export const portalSessionCookieName = cookieName
