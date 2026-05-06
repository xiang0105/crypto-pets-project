import { Router } from 'express'
import { createNonceController, loginController } from '../controllers/authController.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const authRoutes = Router()

authRoutes.post('/nonce', asyncHandler(createNonceController))
authRoutes.post('/login', asyncHandler(loginController))
