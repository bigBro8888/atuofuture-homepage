import jwt from 'jsonwebtoken'
import { config } from '../../config.js'
import { db, publicUser } from '../../lib/store.js'

const rolePermissions = {
  super_admin: ['config:write', 'release:write', 'stats:read', 'users:write', 'audit:read'],
  editor: ['config:write', 'stats:read'],
  publisher: ['release:write', 'stats:read'],
  analyst: ['stats:read'],
}

export function createSession(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: '8h', issuer: 'atuofuture-admin' })
}

export function requireAuth(permission) {
  return (request, response, next) => {
    try {
      const token = request.cookies?.atuo_admin_session
      if (!token) return response.status(401).json({ error: 'authentication_required' })
      const payload = jwt.verify(token, config.jwtSecret, { issuer: 'atuofuture-admin' })
      const user = db().adminUsers.find((item) => item.id === payload.sub && item.enabled)
      if (!user) return response.status(401).json({ error: 'invalid_session' })
      if (permission && !rolePermissions[user.role]?.includes(permission)) {
        return response.status(403).json({ error: 'permission_denied' })
      }
      request.admin = publicUser(user)
      next()
    } catch {
      response.status(401).json({ error: 'invalid_session' })
    }
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  }
}
