export type PetElement = 'citrus' | 'ember' | 'frost' | 'bloom'

export interface LocalizedText {
  zh: string
  en: string
}

export interface PetStatsDefinition {
  iv: number
  hp: number
  maxHp: number
  atk: number
  def: number
}

export interface StarterCapybaraDefinition {
  id: string
  slug: string
  name: string
  asset: {
    image: string
    alt: LocalizedText
  }
  element: PetElement
  stage: number
  tokenURI: string
  stats: PetStatsDefinition
  profile: LocalizedText
}

export const petElementMeta: Record<PetElement, { mark: string; label: LocalizedText; className: string }> = {
  citrus: {
    mark: 'C',
    label: { zh: '柑橘', en: 'Citrus' },
    className: 'is-citrus',
  },
  ember: {
    mark: 'E',
    label: { zh: '火焰', en: 'Ember' },
    className: 'is-ember',
  },
  frost: {
    mark: 'F',
    label: { zh: '冰霜', en: 'Frost' },
    className: 'is-frost',
  },
  bloom: {
    mark: 'B',
    label: { zh: '花園', en: 'Bloom' },
    className: 'is-bloom',
  },
}

export const starterCapybaras: StarterCapybaraDefinition[] = [
  {
    id: 'TEST-PET-001',
    slug: 'capy-san',
    name: 'Capy-san',
    asset: {
      image: 'assets/capybaras/capy-san.png',
      alt: { zh: 'Capy-san 水豚圖片', en: 'Capy-san capybara portrait' },
    },
    element: 'citrus',
    stage: 1,
    tokenURI: 'test-local://pets/capy-san',
    stats: { iv: 84, hp: 100, maxHp: 100, atk: 75, def: 60 },
    profile: {
      zh: 'Capy-san 是一隻柑橘水豚，適合穩定遠征、收集素材與支援隊伍。',
      en: 'Capy-san is a citrus capybara suited for steady expeditions, gathering, and team support.',
    },
  },
  {
    id: 'TEST-PET-002',
    slug: 'yuzu-boy',
    name: 'Yuzu-boy',
    asset: {
      image: 'assets/capybaras/yuzu-boy.png',
      alt: { zh: 'Yuzu-boy 水豚圖片', en: 'Yuzu-boy capybara portrait' },
    },
    element: 'ember',
    stage: 1,
    tokenURI: 'test-local://pets/yuzu-boy',
    stats: { iv: 91, hp: 95, maxHp: 95, atk: 85, def: 40 },
    profile: {
      zh: 'Yuzu-boy 是一隻火焰水豚，擅長突破障礙與快速推進。',
      en: 'Yuzu-boy is an ember capybara that excels at breaking obstacles and pushing forward.',
    },
  },
  {
    id: 'TEST-PET-003',
    slug: 'koko',
    name: 'Koko',
    asset: {
      image: 'assets/capybaras/koko.png',
      alt: { zh: 'Koko 水豚圖片', en: 'Koko capybara portrait' },
    },
    element: 'frost',
    stage: 1,
    tokenURI: 'test-local://pets/koko',
    stats: { iv: 76, hp: 90, maxHp: 90, atk: 55, def: 70 },
    profile: {
      zh: 'Koko 是一隻冰霜水豚，適合穩定遠征、收集素材與支援隊伍。',
      en: 'Koko is a frost capybara suited for cautious routes, gathering, and support.',
    },
  },
  {
    id: 'TEST-PET-004',
    slug: 'bobo',
    name: 'Bobo',
    asset: {
      image: 'assets/capybaras/bobo.png',
      alt: { zh: 'Bobo 水豚圖片', en: 'Bobo capybara portrait' },
    },
    element: 'bloom',
    stage: 1,
    tokenURI: 'test-local://pets/bobo',
    stats: { iv: 88, hp: 120, maxHp: 120, atk: 90, def: 85 },
    profile: {
      zh: 'Bobo 是一隻花園水豚，生命值高，能承受困難路線。',
      en: 'Bobo is a bloom capybara with high stamina for difficult routes.',
    },
  },
]

export const starterCapybaraById = Object.fromEntries(starterCapybaras.map((pet) => [pet.id, pet])) as Record<
  string,
  StarterCapybaraDefinition
>
