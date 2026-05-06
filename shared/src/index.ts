export type WalletAddress = `0x${string}`

export type PetElement = 'citrus' | 'ember' | 'frost' | 'bloom'

export interface PetStats {
  iv: number
  hp: number
  maxHp: number
  atk: number
  def: number
}

export interface PlayerPet {
  id: string
  tokenId: string
  contractAddress: WalletAddress
  chainId: number
  name: string
  element: PetElement
  stage: number
  tokenUri: string
  stats: PetStats
  exp: {
    current: number
    next: number
  }
  birthTime: string
}

export interface PlayerProfile {
  id: string
  wallet: WalletAddress
  username: string | null
  pets: PlayerPet[]
  activeExpedition: ExpeditionSummary | null
}

export type ExpeditionStatus = 'started' | 'claimed' | 'cancelled'

export interface ExpeditionSummary {
  id: string
  petIds: string[]
  startedAt: string
  endsAt: string
  status: ExpeditionStatus
  reward: ExpeditionReward | null
}

export interface ExpeditionReward {
  exp: number
  coins: number
  materials: Array<{
    id: string
    count: number
  }>
}

export interface FriendSummary {
  id: string
  wallet: WalletAddress
  username: string | null
  since: string
}

export interface AuthNonceResponse {
  nonce: string
  message: string
  expiresAt: string
}

export interface AuthLoginResponse {
  token: string
  player: PlayerProfile
}
