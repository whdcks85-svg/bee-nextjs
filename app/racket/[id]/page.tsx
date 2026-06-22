'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase'

const TIERS = ['초심', 'D', 'C', 'B', 'A', '자강']
const TIER_LABELS: Record<string, string> = { 초심: '초심급', D: 'D급', C: 'C급', B: 'B급', A: 'A급', 자강: '자강급' }
const DIMS = ['유연', '밸런스', '무게', '내구', '컨트롤', '파워']
const OFFICIAL = [2.0, 3.0, 3.0, 3.5, 3.5, 3.5]

function RadarChart({ felt, official }: { felt: number[], official: number[] }) {
  const cx = 120, cy = 120, R = 80
  const vx = (r: number, i: number) => {
    const a = (i * 60 * Math.PI) / 180
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)]
  }
  const pts = (vals: number[]) =>
    vals.map((v, i) => vx(R * v / 5, i).map(n => n.toFixed(1)).join(',')).join(' ')

  const gridLines = []
  for (let k = 1; k <= 5; k++) {
    const pp = Array.from({ length: 6 }, (_, i) => vx(R * k / 5, i).map(n => n.toFixed(1)).join(',')).join(' ')
    gridLines.push(<polygon key={k} points={pp} fill="none" stroke="#D4D0CC" strokeWidth={k === 5 ? 1 : 0.5} />)
  }

  return (
    <svg viewBox="0 0 240 240" width="240" height="240">
      {gridLines}
      {Array.from({ length: 6 }, (_, i) => {
        const [x, y] = vx(R, i)
        return <line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke="#D4D0CC" strokeWidth="0.5" />
      })}
      <polygon points={pts(official)} fill="none" stroke="#888780" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points={pts(felt)} fill="rgba(216,90,48,0.22)" stroke="#D85A30" strokeWidth="2" />
      {felt.map((v, i) => {
        const [x, y] = vx(R * v / 5, i)
        return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3" fill="#D85A30" />
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const [x, y] = vx(R + 16, i)
        const dy = i === 0 ? -4 : i === 3 ? 12 : 4
        return <text key={i} x={x.toFixed(1)} y={(y + dy).toFixed(1)} textAnchor="middle" fontSize="11" fill="#6B7280">{DIMS[i]}</text>
      })}
    </svg>
  )
}

export default function RacketPage({ params }: { params: { id: string } }) {
  const [equipment, setEquipment] = useState<any>(null)
  const [stats, setStats] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [tier, setTier] = useState('C')
  const [gender, setGender] = useState('남')
  const [loading, setLoading] = useState(true)
  const sb = createClient()

  useEffect(() => {
    sb.from('equipment').select('*, brands:brand_id(name)').eq('id', params.id).single()
      .then(({ data }) => { setEquipment(data); setLoading(false) })
    sb.from('equipment_tier_stats').select('*').eq('equipment_id', params.id)
      .then(({ data }) => setStats(data ?? []))
    sb.from('reviews').select('*, profiles:user_id(nickname, tier)').eq('equipment_id', params.id).eq('status', 'approved').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setReviews(data ?? []))
  }, [params.id])

  const currentStat = stats.find(s => s.tier === tier && s.gender === gender)
  const felt = currentStat
    ? [currentStat.avg_flexibility, currentStat.avg_balance, currentStat.avg_weight, currentStat.avg_durability, currentStat.avg_control, currentStat.avg_power]
    : [3, 3, 3, 3, 3, 3]

  const specs = equipment?.official_specs ?? {}

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>불러오는 중...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '720px', margin: '0 auto', fontFamily: 'sans-serif', background: '#F7F6F3', minHeight: '100vh' }}>
      <a href="/ranking" style={{ fontSize: '13px', color: '#6B7280', display: 'block', marginBottom: '16px' }}>← 랭킹으로 돌아가기</a>

      <div style={{ background: '#fff', border: '1.5px solid #D4D0CC', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{equipment?.brands?.name}</p>
        <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>{equipment?.model_name}</h1>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {Object.entries(specs).map(([k, v]: any) => (
            <span key={k} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '4px', background: '#EEECEA', color: '#3A3F4A' }}>{v}</span>
          ))}
        </div>
        <p style={{ fontSize: '18px', fontWeight: '700' }}>₩{equipment?.price?.toLocaleString()}</p>
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #D4D0CC', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>급수별 체감 스펙</h2>
        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>회색 점선 = 공식 스펙 / 코랄 = 체감 평균</p>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {TIERS.map(t => (
            <button key={t} onClick={() => setTier(t)} style={{
              padding: '5px 12px', borderRadius: '999px', border: '1.5px solid',
              fontSize: '13px', cursor: 'pointer',
              background: tier === t ? '#D85A30' : '#fff',
              color: tier === t ? '#fff' : '#6B7280',
              borderColor: tier === t ? '#D85A30' : '#D4D0CC'
            }}>{TIER_LABELS[t]}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['남', '여'].map(g => (
            <button key={g} onClick={() => setGender(g)} style={{
              padding: '5px 14px', borderRadius: '999px', border: '1.5px solid',
              fontSize: '13px', cursor: 'pointer',
              background: gender === g ? '#0F6E56' : '#fff',
              color: gender === g ? '#fff' : '#6B7280',
              borderColor: gender === g ? '#0F6E56' : '#D4D0CC'
            }}>{g}</button>
          ))}
          <span style={{ fontSize: '12px', color: '#6B7280', alignSelf: 'center', marginLeft: 'auto' }}>
            표본 {currentStat?.review_count ?? 0}명
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <RadarChart felt={felt} official={OFFICIAL} />
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ display: 'inline-block', width: '16px', height: '2px', background: '#888780', borderTop: '2px dashed #888780' }}></span>공식 스펙
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '10px', background: 'rgba(216,90,48,0.22)', border: '1px solid #D85A30', borderRadius: '2px' }}></span>체감 평균
          </span>
        </div>

        {currentStat && (
          <div style={{ background: '#FAECE7', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#712B13', lineHeight: '1.5' }}>
            {tier}급 {gender}성은 유연함 <b>{felt[0].toFixed(1)}</b>, 밸런스 <b>{felt[1].toFixed(1)}</b>, 파워 <b>{felt[5].toFixed(1)}</b>로 체감합니다.
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #D4D0CC', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>실제 리뷰</h2>
        {reviews.length === 0 && <p style={{ color: '#6B7280', fontSize: '13px' }}>아직 리뷰가 없습니다.</p>}
        {reviews.map((r: any) => (
          <div key={r.id} style={{ borderTop: '1px solid #EEECEA', paddingTop: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{r.profiles?.nickname ?? '익명'}</span>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: '#FAECE7', color: '#993C1D' }}>{r.reviewer_tier_snap}조</span>
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#BA7517' }}>{'★'.repeat(r.rating ?? 0)}</span>
            </div>
            <p style={{ fontSize: '13px', color: '#3A3F4A', lineHeight: '1.6' }}>{r.body}</p>
          </div>
        ))}
      </div>

      <a href={`/review/write?eq=${params.id}`} style={{
        display: 'block', textAlign: 'center', background: '#D85A30', color: '#fff',
        padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '500', textDecoration: 'none'
      }}>리뷰 작성하고 500P 받기 ↗</a>
    </div>
  )
}