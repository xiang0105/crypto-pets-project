import type { Request, Response } from 'express'
import { getPlayerProfile } from '../services/playerService.js'

export async function getPlayerController(request: Request, response: Response) {
  response.json(await getPlayerProfile(request.auth!.userId))
}
