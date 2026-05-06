import { Router } from 'express'
import { claimRewardController, startExpeditionController } from '../controllers/expeditionController.js'
import { addFriendController, getFriendsController } from '../controllers/friendController.js'
import { getPlayerController } from '../controllers/playerController.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { authRoutes } from './authRoutes.js'

export const routes = Router()

routes.get('/health', (_request, response) => response.json({ ok: true }))
routes.use('/auth', authRoutes)
routes.get('/player', requireAuth, asyncHandler(getPlayerController))
routes.post('/start-expedition', requireAuth, asyncHandler(startExpeditionController))
routes.post('/claim-reward', requireAuth, asyncHandler(claimRewardController))
routes.post('/add-friend', requireAuth, asyncHandler(addFriendController))
routes.get('/friends', requireAuth, asyncHandler(getFriendsController))
