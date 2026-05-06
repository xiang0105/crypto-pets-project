import type { Request, Response } from 'express'
import { addFriend, getFriends } from '../services/friendService.js'

export async function addFriendController(request: Request, response: Response) {
  response.status(201).json(await addFriend(request.auth!.userId, request.body))
}

export async function getFriendsController(request: Request, response: Response) {
  response.json(await getFriends(request.auth!.userId))
}
