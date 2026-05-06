import crypto from 'node:crypto'
import { z } from 'zod'
import type { ExpeditionReward, ExpeditionSummary } from '@cryptopets/shared'
import { supabase } from '../config/supabase.js'
import { HttpError } from '../utils/httpError.js'

const startExpeditionSchema = z.object({
  petIds: z.array(z.string().uuid()).min(1).max(4),
  expeditionType: z.enum(['forest', 'market', 'training']).default('forest'),
})

const claimRewardSchema = z.object({
  expeditionId: z.string().uuid(),
})

const EXPEDITION_DURATION_MS = 60 * 60 * 1000

export async function startExpedition(userId: string, input: unknown): Promise<ExpeditionSummary> {
  const body = startExpeditionSchema.parse(input)
  const uniquePetIds = [...new Set(body.petIds)]

  if (uniquePetIds.length !== body.petIds.length) {
    throw new HttpError(400, 'DUPLICATE_PET_IDS')
  }

  const { data: activeExpedition, error: activeError } = await supabase
    .from('expeditions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'started')
    .maybeSingle()

  if (activeError) {
    throw new HttpError(500, 'EXPEDITION_LOOKUP_FAILED')
  }

  if (activeExpedition) {
    throw new HttpError(409, 'EXPEDITION_ALREADY_ACTIVE')
  }

  const { data: pets, error: petsError } = await supabase
    .from('pets')
    .select('id,stats,stage')
    .eq('user_id', userId)
    .in('id', uniquePetIds)

  if (petsError) {
    throw new HttpError(500, 'PETS_LOOKUP_FAILED')
  }

  if ((pets ?? []).length !== uniquePetIds.length) {
    throw new HttpError(403, 'PET_NOT_OWNED')
  }

  const now = new Date()
  const endsAt = new Date(now.getTime() + EXPEDITION_DURATION_MS)

  const { data: expedition, error } = await supabase
    .from('expeditions')
    .insert({
      user_id: userId,
      pet_ids: uniquePetIds,
      expedition_type: body.expeditionType,
      started_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'started',
      reward: null,
    })
    .select('id,pet_ids,started_at,ends_at,status,reward')
    .single()

  if (error || !expedition) {
    throw new HttpError(500, 'EXPEDITION_CREATE_FAILED')
  }

  return {
    id: expedition.id,
    petIds: expedition.pet_ids,
    startedAt: expedition.started_at,
    endsAt: expedition.ends_at,
    status: expedition.status,
    reward: expedition.reward,
  }
}

export async function claimReward(userId: string, input: unknown): Promise<ExpeditionSummary> {
  const body = claimRewardSchema.parse(input)

  const { data: expedition, error: lookupError } = await supabase
    .from('expeditions')
    .select('id,user_id,pet_ids,started_at,ends_at,status,reward')
    .eq('id', body.expeditionId)
    .eq('user_id', userId)
    .single()

  if (lookupError || !expedition) {
    throw new HttpError(404, 'EXPEDITION_NOT_FOUND')
  }

  if (expedition.status !== 'started') {
    throw new HttpError(409, 'EXPEDITION_ALREADY_CLAIMED')
  }

  const now = new Date()

  if (new Date(expedition.ends_at).getTime() > now.getTime()) {
    throw new HttpError(409, 'EXPEDITION_NOT_FINISHED')
  }

  const reward = calculateReward(expedition.id, expedition.pet_ids, expedition.started_at, expedition.ends_at)

  const { data: updated, error: updateError } = await supabase
    .from('expeditions')
    .update({
      status: 'claimed',
      reward,
      claimed_at: now.toISOString(),
    })
    .eq('id', expedition.id)
    .eq('status', 'started')
    .select('id,pet_ids,started_at,ends_at,status,reward')
    .single()

  if (updateError || !updated) {
    throw new HttpError(409, 'EXPEDITION_CLAIM_CONFLICT')
  }

  await applyPetExp(userId, expedition.pet_ids, reward.exp)

  return {
    id: updated.id,
    petIds: updated.pet_ids,
    startedAt: updated.started_at,
    endsAt: updated.ends_at,
    status: updated.status,
    reward: updated.reward,
  }
}

function calculateReward(
  expeditionId: string,
  petIds: string[],
  startedAt: string,
  endsAt: string,
): ExpeditionReward {
  const seed = crypto
    .createHash('sha256')
    .update(`${expeditionId}:${petIds.join(',')}:${startedAt}:${endsAt}`)
    .digest()

  const variance = seed[0] % 31
  return {
    exp: 80 + petIds.length * 20 + variance,
    coins: 40 + petIds.length * 15 + (seed[1] % 21),
    materials: [{ id: seed[2] % 2 === 0 ? 'MAT-2C' : 'MAT-4B', count: 1 + (seed[3] % 2) }],
  }
}

async function applyPetExp(userId: string, petIds: string[], exp: number) {
  const perPetExp = Math.floor(exp / petIds.length)

  const { data: pets, error: lookupError } = await supabase
    .from('pets')
    .select('id,exp_current')
    .eq('user_id', userId)
    .in('id', petIds)

  if (lookupError) {
    throw new HttpError(500, 'PETS_LOOKUP_FAILED')
  }

  await Promise.all(
    (pets ?? []).map((pet) =>
      supabase
        .from('pets')
        .update({ exp_current: pet.exp_current + perPetExp })
        .eq('id', pet.id)
        .eq('user_id', userId),
    ),
  )
}
