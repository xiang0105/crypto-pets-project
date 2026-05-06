import type { ExpeditionSummary, FriendSummary, PlayerProfile } from '@cryptopets/shared'
import { apiRequest } from './client'

export function getPlayer() {
  return apiRequest<PlayerProfile>('/player')
}

export function startExpedition(petIds: string[], expeditionType = 'forest') {
  return apiRequest<ExpeditionSummary>('/start-expedition', {
    method: 'POST',
    body: JSON.stringify({ petIds, expeditionType }),
  })
}

export function claimReward(expeditionId: string) {
  return apiRequest<ExpeditionSummary>('/claim-reward', {
    method: 'POST',
    body: JSON.stringify({ expeditionId }),
  })
}

export function addFriend(wallet: string) {
  return apiRequest<{ status: 'pending' | 'accepted' }>('/add-friend', {
    method: 'POST',
    body: JSON.stringify({ wallet }),
  })
}

export function getFriends() {
  return apiRequest<FriendSummary[]>('/friends')
}
