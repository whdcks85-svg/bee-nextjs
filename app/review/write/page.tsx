'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '../../../lib/supabase'

const DIMS = [
  { key: 'flexibility', label: '유연함', lo: '딱딱', hi: '유연' },
  { key: 'balance', label: '밸런스', lo: '헤드라이트', hi: '헤드헤비' },
  { key: 'weight', label: '무게감', lo: '가벼움', hi: '무거움' },
  { key: 'durability', label: '내구성', lo: '약함', hi: '튼튼' },
  { key: 'control', label: '컨트롤', lo: '낮음', hi: '정밀' },
  { key: 'power', label: '파워', lo: '낮음', hi: '강함' },
]
const OFFICIAL = [2.0, 3.0, 3.0, 3.5, 3.5, 3.5]
const PERIODS = ['3개월 미만', '3~6개월', '6개월~1년', '1년 이상']

function MiniRadar({ felt }: { felt: number[] }) {
  const cx = 70, cy = 70, R = 50
  const vx = (r: number, i: number) => {
    const a = (i * 60 * Math.PI) / 180
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)]
  }
  const pts = (vals: number[]) =>
    vals.map((v, i) => vx(R * v / 5, i).map(n => n.toFixed(1)).join(',')).join(' ')
  const grid = Array.from({ length: 5 }, (_, k) => {
    const pp = Array.from({ length: 6 }, (_, i) => vx(R * (k + 1) / 5, i).map(n => n.toFixed(1)).join(',')).join(' ')
    return <polygon key={k} points={pp} fill="none" stroke="#D4D0CC" strokeWidth="0.5" />
  })
  return (
    <svg viewBox="0 0 140 140" width="140" height="140">
      {grid}
      {Array.from({ length: 6 }, (_, i) => {
        const [x, y] = vx(R, i)
        return <line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke="#D4D0CC" strokeWidth="0.5" />
      })}
      <polygon points={pts(OFFICIAL)} fill="none" stroke="#888780" strokeWidth="1" strokeDasharray="3 2" />
      <polygon points={pts(felt)} fill="rgba(216,90,48,0.22)" stroke="#D85A30" strokeWidth="1.5" />
    </svg>
  )
}

export default function WriteReviewPage() {
  const [felt, setFelt] = useState({ flexibility: 3, balance: 3, weight: 3, durability: 3, control: 3, power: 3 })
  const [rating, setRating] = useState(0)
  const [period, setPeriod] = useState('')
  const [body, setBody] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const sb = createClient()

  const feltArr = DIMS.map(d => felt[d.key as keyof typeof felt])
  const avg = (feltArr.reduce((a, b) => a + b, 0) / 6).toFixed(1)

  const submit = async () => {
    if (body.length < 50) { alert('후기를 50자 이상 작성해주세요'); return }
    setLoading(true)
    const params = new URLSearchParams(window.location.search)
    const eqId = params.get('eq') ?? ''
    const { error } = await sb.from('reviews').insert({
      user_id: 'a0000000-0000-0000-0000-000000000001',
      equipment_id: eqId,
      reviewer_tier_snap: 'C',
      gender_snap: '남',
      years_played_snap: 4,
      flexibility_felt: felt.flexibility,
      balance_felt: felt.balance,
      weight_felt: felt.weight,
      durability_felt: felt.durability,
      control_felt: felt.control,
      power_felt: felt.power,
      rating,
      usage_period: period,
      body,
      status: 'pending',
    })
    setLoading(false)
    if (error) { alert('오류: ' + error.message); return }
    setDone(true)
  }

  if (done) return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>리뷰가 접수됐습니다!</h2>
      <p style={{ color: '#6B7280', marginBottom: '24px' }}>AI 품질 검토 후 500P가 적립됩니다.</p>
      <a href="/ranking" style={{ background: '#D85A30', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '15px' }}>랭킹으로 돌아가기</a>
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: '720px', margin: '0 auto', fontFamily: 'sans-serif', background: '#F7F6F3', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700' }}>리뷰 작성</h1>
        <span style={{ fontSize: '13px', color: '#0F6E56', fontWeight: '500' }}>작성 완료 시 500P</span>
      </div>

      <div style={{ background: '#FAECE7', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#712B13' }}>
        이 리뷰는 <b>C조 · 구력 4년</b>으로 기록됩니다
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #D4D0CC', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <MiniRadar felt={feltArr} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>실시간 미리보기</p>
            <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>슬라이더를 움직이면 코랄(체감)이 회색 점선(공식)과 비교됩니다.</p>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>체감 종합 <b style={{ color: '#D85A30' }}>{avg}</b> / 5.0</p>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #D4D0CC', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>점도표 입력</h2>
        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '14px' }}>회색 눈금 = 제조사 공식 스펙</p>
        {DIMS.map((d, j) => (
          <div key={d.key} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
              <span>{d.label}</span>
              <span style={{ fontWeight: '500', color: '#D85A30' }}>{felt[d.key as keyof typeof felt]}</span>
            </div>
            <div style={{ position: 'relative', height: '28px', display: 'flex', alignItems: 'center' }}>
              <div style={{
                position: 'absolute', left: `calc(${(OFFICIAL[j] - 1) / 4 * 100}% - 1px)`,
                width: '2px', height: '16px', background: '#9A968C', zIndex: 0, borderRadius: '1px'
              }} />
              <input type="range" min="1" max="5" step="1"
                value={felt[d.key as keyof typeof felt]}
                onChange={e => setFelt(prev => ({ ...prev, [d.key]: Number(e.target.value) }))}
                style={{ width: '100%', position: 'relative', zIndex: 1, accentColor: '#D85A30' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9A968C' }}>
              <span>{d.lo}</span><span>{d.hi}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #D4D0CC', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>사용 기간</h2>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '7px 14px', borderRadius: '999px', border: '1.5px solid', fontSize: '13px', cursor: 'pointer',
              background: period === p ? '#0D1117' : '#fff', color: period === p ? '#fff' : '#6B7280',
              borderColor: period === p ? '#0D1117' : '#D4D0CC'
            }}>{p}</button>
          ))}
        </div>

        <h2 style={{ fontSize: '15px', fontWeight: '700', margin: '14px 0 8px' }}>전체 만족도</h2>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setRating(n)} style={{
              fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer',
              color: n <= rating ? '#BA7517' : '#D4D0CC'
            }}>★</button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #D4D0CC', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700' }}>주관적 후기</h2>
          <span style={{ fontSize: '12px', color: body.length >= 50 ? '#0F6E56' : '#6B7280' }}>{body.length} / 50자</span>
        </div>
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={4}
          placeholder="스매시·클리어·수비 등 상황별로 느낀 점을 적어주세요."
          style={{ width: '100%', padding: '10px', fontSize: '13px', border: '1px solid #D4D0CC', borderRadius: '8px', resize: 'vertical', fontFamily: 'sans-serif', lineHeight: '1.6' }}
        />
      </div>

      <button onClick={submit} disabled={loading || body.length < 50} style={{
        width: '100%', padding: '14px', fontSize: '15px', fontWeight: '500',
        background: body.length >= 50 ? '#D85A30' : '#D4D0CC',
        color: '#fff', border: 'none', borderRadius: '10px', cursor: body.length >= 50 ? 'pointer' : 'default'
      }}>
        {loading ? '제출 중...' : '등록하고 500P 받기 ↗'}
      </button>
    </div>
  )
}