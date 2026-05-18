import type { LocalizedText, PetElement } from './capybaras.js'

export type ForestId = 'orange' | 'apple' | 'snow-peach'
export type StoryCheckMetric = 'teamPower' | 'teamHp' | 'teamAtk' | 'teamDef'
export type StoryCheckOperator = 'gte' | 'gt' | 'lte' | 'lt'

export interface StoryCondition {
  metric?: StoryCheckMetric
  operator?: StoryCheckOperator
  value?: number
  leaderElement?: PetElement
}

export interface StoryOutcome {
  id: string
  condition?: StoryCondition
  text: LocalizedText
  rewardMultiplier?: number
  tags?: string[]
}

export interface StoryBeat {
  id: string
  setup: LocalizedText
  outcomes: StoryOutcome[]
}

export interface ExpeditionForest {
  id: ForestId
  asset: {
    cover?: string
    iconKey: string
  }
  difficulty: number
  durationSeconds: number
  reward: string
  name: LocalizedText
  summary: LocalizedText
  scriptEvents: StoryBeat[]
}

export interface GameStoryChapter {
  id: string
  title: LocalizedText
  description: LocalizedText
  beats: StoryBeat[]
}

export const expeditionForests: ExpeditionForest[] = [
  {
    id: 'orange',
    asset: {
      iconKey: 'forest-orange',
    },
    difficulty: 1,
    durationSeconds: 45,
    reward: 'Yuzu x2',
    name: { zh: '橘子森林', en: 'Orange Forest' },
    summary: { zh: '路線短、資源穩定，適合測試新隊伍。', en: 'A short, stable route for testing new parties.' },
    scriptEvents: [
      {
        id: 'orange-peel-trail',
        setup: { zh: '隊伍在橘子樹下找到發光果皮。', en: 'The party found glowing peel under an orange tree.' },
        outcomes: [
          {
            id: 'orange-peel-citrus-leader',
            condition: { leaderElement: 'citrus' },
            text: {
              zh: '隊長的柑橘屬性與果皮氣味共鳴，隊伍快速找到安全路線。',
              en: 'The citrus leader resonated with the peel scent and quickly found a safe route.',
            },
            rewardMultiplier: 1.15,
            tags: ['leader-element'],
          },
          {
            id: 'orange-peel-normal',
            text: {
              zh: '隊伍沿著果皮微光前進，穩定記下森林路線。',
              en: 'The party followed the glow and steadily mapped the forest route.',
            },
          },
        ],
      },
      {
        id: 'orange-slick-moss',
        setup: { zh: '濕滑青苔覆蓋小徑。', en: 'Slick moss covered the path.' },
        outcomes: [
          {
            id: 'orange-moss-high-defense',
            condition: { metric: 'teamDef', operator: 'gte', value: 220 },
            text: {
              zh: '隊伍防禦足夠，前排水豚穩住隊形，沒有浪費太多時間。',
              en: 'The party had enough defense to hold formation without losing much time.',
            },
            rewardMultiplier: 1.1,
          },
          {
            id: 'orange-moss-slip',
            text: {
              zh: '隊伍稍微打滑，只能放慢腳步繞過濕地。',
              en: 'The party slipped slightly and had to slow down around the wet ground.',
            },
            rewardMultiplier: 0.95,
          },
        ],
      },
      {
        id: 'orange-rolling-fruit',
        setup: { zh: '巨大的橘子從坡上滾下。', en: 'A giant orange rolled downhill.' },
        outcomes: [
          {
            id: 'orange-fruit-high-attack',
            condition: { metric: 'teamAtk', operator: 'gte', value: 260 },
            text: {
              zh: '隊伍攻擊力足夠，合力把橘子推回坡道，取得額外果肉。',
              en: 'The party had enough attack to shove it back and secure extra pulp.',
            },
            rewardMultiplier: 1.2,
          },
          {
            id: 'orange-fruit-dodge',
            text: {
              zh: '隊伍避開滾落的橘子，雖然安全通過，但錯過部分素材。',
              en: 'The party dodged the rolling fruit and passed safely, but missed some materials.',
            },
            rewardMultiplier: 0.9,
          },
        ],
      },
    ],
  },
  {
    id: 'apple',
    asset: {
      iconKey: 'forest-apple',
    },
    difficulty: 2,
    durationSeconds: 90,
    reward: 'Jam x1',
    name: { zh: '蘋果森林', en: 'Apple Forest' },
    summary: { zh: '樹根迷宮較複雜，需要隊伍有足夠攻防。', en: 'A winding root maze that asks for better attack and defense.' },
    scriptEvents: [
      {
        id: 'apple-root-maze',
        setup: { zh: '隊伍進入樹根迷宮。', en: 'The party entered the root maze.' },
        outcomes: [
          {
            id: 'apple-maze-high-power',
            condition: { metric: 'teamPower', operator: 'gte', value: 500 },
            text: {
              zh: '隊伍總能力超過 500，能快速分工探路，找出最短出口。',
              en: 'With team power above 500, the party split scouting duties and found the shortest exit.',
            },
            rewardMultiplier: 1.2,
          },
          {
            id: 'apple-maze-lost',
            text: {
              zh: '隊伍在相似的樹根間迷路，只能沿著刻痕慢慢修正方向。',
              en: 'The party got lost among similar roots and slowly corrected course using trail marks.',
            },
            rewardMultiplier: 0.9,
          },
        ],
      },
      {
        id: 'apple-fruit-mist',
        setup: { zh: '酸甜果霧讓視線和體力一起下降。', en: 'Sweet-tart fruit mist reduced both vision and stamina.' },
        outcomes: [
          {
            id: 'apple-mist-high-hp',
            condition: { metric: 'teamHp', operator: 'gte', value: 360 },
            text: {
              zh: '隊伍生命值充足，輪流開路後仍保有穩定節奏。',
              en: 'The party had enough HP to rotate leaders and keep a steady pace.',
            },
            rewardMultiplier: 1.1,
          },
          {
            id: 'apple-mist-fatigue',
            text: {
              zh: '隊伍體力被果霧消耗，被迫多休息一次。',
              en: 'The mist drained stamina and forced one extra rest.',
            },
            rewardMultiplier: 0.9,
          },
        ],
      },
      {
        id: 'apple-seed-guardian',
        setup: { zh: '種子守衛擋住出口。', en: 'A seed guardian blocked the exit.' },
        outcomes: [
          {
            id: 'apple-guardian-ember-leader',
            condition: { leaderElement: 'ember' },
            text: {
              zh: '火焰隊長點燃乾燥落葉製造聲響，成功引開守衛。',
              en: 'The ember leader lit dry leaves to distract the guardian.',
            },
            rewardMultiplier: 1.15,
            tags: ['leader-element'],
          },
          {
            id: 'apple-guardian-standard',
            text: {
              zh: '隊伍以協同攻防突破出口，取得一罐濃厚果醬。',
              en: 'The party used coordinated attack and defense to break through and earn thick jam.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'snow-peach',
    asset: {
      iconKey: 'forest-snow-peach',
    },
    difficulty: 3,
    durationSeconds: 150,
    reward: 'Snow Peach x1',
    name: { zh: '雪蜜桃森林', en: 'Snow Peach Forest' },
    summary: { zh: '寒霧會消耗生命值，但完成後回報最好。', en: 'Cold mist drains stamina, but the final report is richest.' },
    scriptEvents: [
      {
        id: 'snow-ice-bridge',
        setup: { zh: '冰霜落在林間，前方出現數座雪橋。', en: 'Fine ice fell through the forest, revealing several snow bridges.' },
        outcomes: [
          {
            id: 'snow-bridge-frost-leader',
            condition: { leaderElement: 'frost' },
            text: {
              zh: '冰霜隊長辨識出不會碎裂的雪橋，隊伍省下大量時間。',
              en: 'The frost leader identified stable snow bridges and saved the party significant time.',
            },
            rewardMultiplier: 1.2,
            tags: ['leader-element'],
          },
          {
            id: 'snow-bridge-careful',
            text: {
              zh: '隊伍逐一測試雪橋，雖然慢了些，但沒有發生意外。',
              en: 'The party tested each bridge one by one; slower, but safe.',
            },
          },
        ],
      },
      {
        id: 'snow-whiteout',
        setup: { zh: '寒霧吞沒視線，隊伍開始失去方向感。', en: 'Cold mist swallowed visibility and the party began losing its sense of direction.' },
        outcomes: [
          {
            id: 'snow-whiteout-high-hp',
            condition: { metric: 'teamHp', operator: 'gte', value: 380 },
            text: {
              zh: '隊伍生命值充足，高耐力成員輪流帶路，維持完整隊形。',
              en: 'With enough HP, high-stamina allies took turns leading and kept formation intact.',
            },
            rewardMultiplier: 1.15,
          },
          {
            id: 'snow-whiteout-low-hp',
            text: {
              zh: '隊伍被寒霧拖慢，必須消耗更多補給才抵達安全地帶。',
              en: 'The mist slowed the party and forced extra supplies before reaching safety.',
            },
            rewardMultiplier: 0.85,
          },
        ],
      },
      {
        id: 'snow-peach-blossom',
        setup: { zh: '雪蜜桃花在終點短暫盛開。', en: 'Snow-peach blossoms briefly opened at the end.' },
        outcomes: [
          {
            id: 'snow-blossom-high-power',
            condition: { metric: 'teamPower', operator: 'gte', value: 650 },
            text: {
              zh: '隊伍總能力超過 650，成功採集完整花蜜，遠征報告非常豐厚。',
              en: 'With team power above 650, the party collected full nectar and returned with a rich report.',
            },
            rewardMultiplier: 1.35,
          },
          {
            id: 'snow-blossom-normal',
            text: {
              zh: '隊伍趕在花朵閉合前採到少量花蜜，仍帶回珍貴成果。',
              en: 'The party gathered a little nectar before the flowers closed and still returned with rare findings.',
            },
          },
        ],
      },
    ],
  },
]

export const gameStoryChapters: GameStoryChapter[] = [
  {
    id: 'starter-gift',
    title: { zh: '測試階段贈送水豚', en: 'Testing Starter Gift' },
    description: {
      zh: '目前測試階段每次登入都視為新用戶，贈送原先四隻水豚。未來正式上鏈後，會改由錢包是否曾登入遊戲與鏈上領取紀錄判斷。',
      en: 'During testing, every login is treated as a new user and receives the four starter capybaras. On-chain mode will use wallet and claim records instead.',
    },
    beats: [
      {
        id: 'gift-wallet-login',
        setup: {
          zh: '玩家連接 MetaMask。',
          en: 'The player connects MetaMask.',
        },
        outcomes: [{
          id: 'gift-wallet-login-success',
          text: {
          zh: '玩家連接 MetaMask 後取得錢包地址。',
          en: 'The player connects MetaMask and receives a wallet address.',
          },
        }],
      },
      {
        id: 'gift-local-starters',
        setup: {
          zh: '測試模式確認錢包地址。',
          en: 'Testing mode confirms the wallet address.',
        },
        outcomes: [{
          id: 'gift-local-starters-success',
          text: {
          zh: '測試模式建立四隻本地水豚，用於驗證升級與遠征流程。',
          en: 'Testing mode creates four local capybaras to verify leveling and expedition flows.',
          },
        }],
      },
    ],
  },
]
