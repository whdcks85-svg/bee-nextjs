'use client'
import { useEffect, useState } from 'react'
import { getRankingByTier } from '../../lib/queries'

const TIERS = ['초심', 'D', 'C', 'B', 'A', '자강']
const LABELS: Record<string, string> = { 초심: '초심급', D: 'D급', C: 'C급', B: 'B급', A: 'A급', 자강: '자강급' }
const DIMS = ['유연', '밸런스', '무게', '내구', '컨트롤', '파워']

export default function RankingPage() {
  const [tier, setTier] = useState('C')
  const [gender, setGender] = useState('남')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getRankingByTier(tier, gender).then((d: any[]) => { setData(d); setLoading(false) })
  }, [tier, gender])

  return (
    <div style={{ padding: '24px', maxWidth: '720px', margin: '0 auto', fontFamily: 'sans-serif', background: '#F7F6F3', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
        <span style={{ color: '#D85A30' }}>B</span>ee 라켓 랭킹
      </h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>급수별 실사용 체감 데이터</p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {TIERS.map(t => (
          <button key={t} onClick={() => setTier(t)} style={{
            padding: '7px 16px', borderRadius: '999px', border: '1.5px solid',
            fontSize: '14px', cursor: 'pointer', fontWeight: tier === t ? '700' : '400',
            background: tier === t ? '#D85A30' : '#fff',
            color: tier === t ? '#fff' : '#6B7280',
            borderColor: tier === t ? '#D85A30' : '#D4D0CC'
          }}>{LABELS[t]}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['남', '여'].map(g => (
          <button key={g} onClick={() => setGender(g)} style={{
            padding: '7px 18px', borderRadius: '999px', border: '1.5px solid',
            fontSize: '14px', cursor: 'pointer',
            background: gender === g ? '#0F6E56' : '#fff',
            color: gender === g ? '#fff' : '#6B7280',
            borderColor: gender === g ? '#0F6E56' : '#D4D0CC'
          }}>{g}</button>
        ))}
      </div>

      {loading && <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px' }}>불러오는 중...</p>}
      {!loading && data.length === 0 && (
        <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px' }}>해당 급수/성별 데이터가 없습니다</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((item: any, i: number) => {
          const eq = item.equipment
          const brand = eq?.brands?.name ?? ''
          const felt = [item.avg_flexibility, item.avg_balance, item.avg_weight, item.avg_durability, item.avg_control, item.avg_power]
          const avg = felt.reduce((a: number, b: number) => a + (b || 0), 0) / felt.length
          const score = (avg * 0.6 + (item.avg_rating || 0) * 0.4).toFixed(1)
          const rankColor = i === 0 ? '#D85A30' : i === 1 ? '#BA7517' : i === 2 ? '#0F6E56' : '#6B7280'
          return (
            <div key={item.equipment_id} style={{ background: '#fff', border: '1.5px solid #D4D0CC', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '52px', background: '#EEECEA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #D4D0CC', padding: '16px 0' }}>
                <span style={{ fontWeight: '700', fontSize: '20px', color: rankColor }}>{i + 1}</span>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>{score}</span>
              </div>
              <div style={{ flex: 1, padding: '14px 16px' }}>
                <p style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>{brand}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '700' }}>{eq?.model_name}</p>
                  <span style={{ fontSize: '14px', fontWeight: '700' }}>₩{eq?.price?.toLocaleString()}</span>
                </div>
                {DIMS.map((label, j) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#6B7280', width: '36px' }}>{label}</span>
                    <div style={{ flex: 1, height: '6px', background: '#EEECEA', borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: `${((felt[j] || 0) / 5) * 100}%`, background: '#D85A30', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '11px', width: '24px', textAlign: 'right' }}>{(felt[j] || 0).toFixed(1)}</span>
                  </div>
                ))}
                <p style={{ fontSize: '11px', color: '#0F6E56', marginTop: '6px' }}>리뷰 {item.review_count}건 · {item.avg_rating?.toFixed(1)}★</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}