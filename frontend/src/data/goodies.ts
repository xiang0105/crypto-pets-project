import type { GoodieElement, GoodieGrade, ListingStatus } from '@cryptopets/game-content'

export type { GoodieElement, GoodieGrade, ListingStatus }

export interface GoodieSft {
  id: string
  name: {
    zh: string
    en: string
  }
  element: GoodieElement
  grade: GoodieGrade
  amount: number
  description: string
  price: number
  status: ListingStatus
}

// Keep this local cache empty until it is hydrated from wallet-owned on-chain SFTs.
export const goodies: GoodieSft[] = []

export function replaceGoodies(nextGoodies: GoodieSft[]) {
  goodies.splice(0, goodies.length, ...nextGoodies)
}
