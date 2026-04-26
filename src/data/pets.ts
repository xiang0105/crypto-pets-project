export type PetElement = 'citrus' | 'ember' | 'frost' | 'bloom'

export interface Pet {
  id: string
  name: string
  element: PetElement
  stage: number
  tokenURI: string
  stats: {
    iv: number
    hp: number
    maxHp: number
    atk: number
    def: number
  }
  exp: {
    current: number
    next: number
  }
  owner: string
  birthTime: string
}

export const pets: Pet[] = [
  {
    id: 'PET-001',
    name: 'Capy-san',
    element: 'citrus',
    stage: 1,
    tokenURI: 'local://pets/capy-san',
    stats: {
      iv: 84,
      hp: 100,
      maxHp: 100,
      atk: 75,
      def: 60,
    },
    exp: {
      current: 880,
      next: 1200,
    },
    owner: '0x7A...9E2',
    birthTime: '2026-04-25T08:30:00Z',
  },
  {
    id: 'PET-002',
    name: 'Yuzu-boy',
    element: 'ember',
    stage: 1,
    tokenURI: 'local://pets/yuzu-boy',
    stats: {
      iv: 91,
      hp: 95,
      maxHp: 95,
      atk: 85,
      def: 40,
    },
    exp: {
      current: 720,
      next: 1000,
    },
    owner: '0x7A...9E2',
    birthTime: '2026-04-25T09:10:00Z',
  },
  {
    id: 'PET-003',
    name: 'Koko',
    element: 'frost',
    stage: 2,
    tokenURI: 'local://pets/koko',
    stats: {
      iv: 76,
      hp: 90,
      maxHp: 90,
      atk: 55,
      def: 70,
    },
    exp: {
      current: 640,
      next: 900,
    },
    owner: '0x7A...9E2',
    birthTime: '2026-04-25T10:45:00Z',
  },
  {
    id: 'PET-004',
    name: 'Bobo',
    element: 'bloom',
    stage: 2,
    tokenURI: 'local://pets/bobo',
    stats: {
      iv: 88,
      hp: 120,
      maxHp: 120,
      atk: 90,
      def: 85,
    },
    exp: {
      current: 960,
      next: 1300,
    },
    owner: '0x7A...9E2',
    birthTime: '2026-04-25T12:15:00Z',
  },
]
