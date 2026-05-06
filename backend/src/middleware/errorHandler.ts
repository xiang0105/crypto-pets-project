import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { HttpError } from '../utils/httpError.js'

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'VALIDATION_ERROR',
      details: error.flatten(),
    })
    return
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message })
    return
  }

  console.error(error)
  response.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
}
