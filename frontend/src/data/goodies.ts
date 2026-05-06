export type GoodieElement = 1 | 2 | 3 | 4
export type GoodieGrade = 'A' | 'B' | 'C' | 'D'
export type ListingStatus = 'active' | 'sold' | 'draft'

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

export const goodies: GoodieSft[] = [
  {
    id: 'MAT-1C',
    name: {
      zh: '柚果',
      en: 'Yuzu',
    },
    element: 1,
    grade: 'C',
    amount: 18,
    description: 'A citrus snack used for early pet growth.',
    price: 100,
    status: 'active',
  },
  {
    id: 'MAT-2C',
    name: {
      zh: '香草',
      en: 'Herbs',
    },
    element: 2,
    grade: 'C',
    amount: 12,
    description: 'Fresh herbs gathered from expedition routes.',
    price: 80,
    status: 'active',
  },
  {
    id: 'MAT-3B',
    name: {
      zh: '小盔',
      en: 'Helmet',
    },
    element: 3,
    grade: 'B',
    amount: 2,
    description: 'A sturdy material for defensive upgrades.',
    price: 500,
    status: 'active',
  },
  {
    id: 'MAT-4C',
    name: {
      zh: '浴鹽',
      en: 'Salts',
    },
    element: 4,
    grade: 'C',
    amount: 9,
    description: 'Restores energy before a long adventure.',
    price: 120,
    status: 'active',
  },
  {
    id: 'MAT-1B',
    name: {
      zh: '柿醬',
      en: 'Jam',
    },
    element: 1,
    grade: 'B',
    amount: 6,
    description: 'A sweet resource for bloom-aligned recipes.',
    price: 220,
    status: 'sold',
  },
  {
    id: 'MAT-2B',
    name: {
      zh: '彩扇',
      en: 'Fan',
    },
    element: 2,
    grade: 'B',
    amount: 3,
    description: 'A rare collectible charm from the market route.',
    price: 650,
    status: 'draft',
  },
  {
    id: 'MAT-4B',
    name: {
      zh: '櫻花',
      en: 'Bloom',
    },
    element: 4,
    grade: 'B',
    amount: 7,
    description: 'A bloom material for stage-one evolution paths.',
    price: 290,
    status: 'active',
  },
  {
    id: 'MAT-2A',
    name: {
      zh: '盆景',
      en: 'Garden',
    },
    element: 2,
    grade: 'A',
    amount: 1,
    description: 'An advanced material for special training.',
    price: 900,
    status: 'active',
  },
  {
    id: 'MAT-3A',
    name: {
      zh: '鈴鐺',
      en: 'Bell',
    },
    element: 3,
    grade: 'A',
    amount: 1,
    description: 'A premium charm for high-grade pet upgrades.',
    price: 1100,
    status: 'draft',
  },
  {
    id: 'MAT-4A',
    name: {
      zh: '短襪',
      en: 'Socks',
    },
    element: 4,
    grade: 'A',
    amount: 2,
    description: 'A cozy collectible with strong marketplace demand.',
    price: 350,
    status: 'draft',
  },
  {
    id: 'MAT-1A',
    name: {
      zh: '研缽',
      en: 'Grinder',
    },
    element: 1,
    grade: 'A',
    amount: 1,
    description: 'A crafted tool used to prepare evolution materials.',
    price: 550,
    status: 'draft',
  },
  {
    id: 'MAT-3C',
    name: {
      zh: '絨球',
      en: 'Pompom',
    },
    element: 3,
    grade: 'C',
    amount: 10,
    description: 'A common lucky charm for new pet owners.',
    price: 180,
    status: 'draft',
  },
]
