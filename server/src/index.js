import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import { initStore } from './lib/store.js'
import { publicAppsRouter } from './modules/apps/public-routes.js'
import { adminRouter } from './modules/admin/routes.js'
import { adminPagesRouter, publicPagesRouter } from './modules/pages/routes.js'

await initStore()

export const app = express()
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
  hsts: false,
}))
app.use(express.json({ limit: '8mb' }))
app.use(express.urlencoded({ extended: false, limit: '8mb' }))
app.use(cookieParser())

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok', service: 'atuofuture-app-distribution', time: new Date().toISOString() })
})
app.use('/api/public/uploads', express.static(config.uploadDir, {
  fallthrough: false,
  etag: false,
  lastModified: true,
  acceptRanges: false,
  maxAge: '1h',
  setHeaders(response) {
    response.setHeader('Cache-Control', 'public, max-age=3600')
    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  },
}))
app.use('/api/public/apps', publicAppsRouter)
app.use('/api/public/pages', publicPagesRouter)
app.use('/api/admin/pages', adminPagesRouter)
app.use('/api/admin', adminRouter)

app.use('/api', (request, response) => response.status(404).json({ error: 'not_found' }))
app.use((error, request, response, next) => {
  if (response.headersSent) return next(error)
  const status = Number(error.status || (error.code === 'LIMIT_FILE_SIZE' ? 413 : 500))
  if (status >= 500) console.error(error)
  response.status(status).json({
    error: status >= 500 ? 'service_error' : 'request_error',
    message: error.message || '服务暂不可用',
  })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, config.host, () => {
    console.log(`App distribution API listening on http://${config.host}:${config.port}`)
    if (config.jwtSecret.includes('change-this')) console.warn('Warning: JWT_SECRET is using the development default')
  })
}
