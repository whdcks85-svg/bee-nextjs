'use client'

import { createClient } from './supabase'

export async function getRankingByTier(tier: string, gender: string, limit = 20) {
  const sb = createClient()
  console.log('쿼리 시작:', tier, gender)   // ← 이 줄 추가
  const { data, error } = await sb
    .from('equipment_tier_stats')
    .select('*, equipment:equipment_id(id, model_name, price, official_specs, brands:brand_id(name))')
    .eq('tier', tier)
    .eq('gender', gender)
    .gte('review_count', 1)
    .order('avg_rating', { ascending: false })
    .limit(limit)
  console.log('결과:', data, '에러:', error)   // ← 이 줄 추가
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getTierStats(equipmentId: string, tier?: string, gender?: string) {
  const sb = createClient()
  let q = sb.from('equipment_tier_stats').select('*').eq('equipment_id', equipmentId)
  if (tier) q = q.eq('tier', tier)
  if (gender) q = q.eq('gender', gender)
  const { data } = await q
  return data ?? []
}

export async function getReviews(equipmentId: string, tier?: string) {
  const sb = createClient()
  let q = sb.from('reviews').select('*').eq('equipment_id', equipmentId).eq('status', 'approved').order('created_at', { ascending: false })
  if (tier) q = q.eq('reviewer_tier_snap', tier)
  const { data } = await q
  return data ?? []
}
