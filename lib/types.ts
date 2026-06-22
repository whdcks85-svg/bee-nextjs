export type Tier = '초심' | 'D' | 'C' | 'B' | 'A' | '자강'
export type Gender = 'M' | 'F'

export interface RankingItem {
  equipment_id: string
  name: string
  brand: string
  tier: Tier
  gender: Gender
  rank: number
  review_count: number
  avg_power: number
  avg_control: number
  avg_repulsion: number
  avg_durability: number
  avg_weight: number
}

export interface TierStats {
  avg_power: number
  avg_control: number
  avg_repulsion: number
  avg_durability: number
  avg_weight: number
  review_count: number
}

export interface Review {
  id: string
  equipment_id: string
  tier: Tier
  author_tier: string
  content: string
  rating: number
  created_at: string
}
