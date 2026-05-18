import type { PlayerProfile } from '@cryptopets/shared'
import { supabase } from '../config/supabase.js'
import { HttpError } from '../utils/httpError.js'

export async function initializePlayerIfNeeded(userId: string) {
  void userId
  // Reserved for future chain sync:
  // 1. Read ERC-721 pet ownership.
  // 2. Read ERC-1155 material balances.
  // 3. Mirror only indexable metadata needed by the API.
}

export async function getPlayerProfile(userId: string): Promise<PlayerProfile> {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id,wallet,username')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    throw new HttpError(404, 'PLAYER_NOT_FOUND')
  }

  const { data: pets, error: petsError } = await supabase
    .from('pets')
    .select('id,token_id,contract_address,chain_id,name,element,stage,token_uri,stats,exp_current,exp_next,birth_time')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (petsError) {
    throw new HttpError(500, 'PETS_LOOKUP_FAILED')
  }

  const { data: expedition, error: expeditionError } = await supabase
    .from('expeditions')
    .select('id,pet_ids,started_at,ends_at,status,reward')
    .eq('user_id', userId)
    .eq('status', 'started')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (expeditionError) {
    throw new HttpError(500, 'EXPEDITION_LOOKUP_FAILED')
  }

  return {
    id: user.id,
    wallet: user.wallet,
    username: user.username,
    pets: (pets ?? []).map((pet) => ({
      id: pet.id,
      tokenId: pet.token_id,
      contractAddress: pet.contract_address,
      chainId: pet.chain_id,
      name: pet.name,
      element: pet.element,
      stage: pet.stage,
      tokenUri: pet.token_uri,
      stats: pet.stats,
      exp: {
        current: pet.exp_current,
        next: pet.exp_next,
      },
      birthTime: pet.birth_time,
    })),
    activeExpedition: expedition
      ? {
          id: expedition.id,
          petIds: expedition.pet_ids,
          startedAt: expedition.started_at,
          endsAt: expedition.ends_at,
          status: expedition.status,
          reward: expedition.reward,
        }
      : null,
  }
}
