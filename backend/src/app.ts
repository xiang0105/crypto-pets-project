import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { routes } from './routes/index.js'

export function createApp() {
  const app = express()

  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: false,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  app.use(express.json({ limit: '32kb' }))
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  app.use(routes)
  app.use(errorHandler)

  return app
}
