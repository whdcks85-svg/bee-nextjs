'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Tier, Gender, RankingItem } from '@/lib/types'

const TIERS: Tier[] = ['초심', 'D', 'C', 'B', 'A', '자강']

async function fetchRankings(tier: Tier, gender: Gender): Promise<RankingItem[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('equipment_tier_stats')
    .select('*')
    .eq('tier', tier)
    .eq('gender', gender)
    .order('rank', { ascending: true })
    .limit(20)
  return (data ?? []) as RankingItem[]
}

// ─── Radar Chart ────────────────────────────────────────────────────────────

const RADAR_LABELS = ['파워', '컨트롤', '반발력', '내구성', '무게감']
const CX = 90, CY = 90, R = 50, LR = 67

function radarPt(val: number, i: number, radius = R) {
  const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5
  return {
    x: CX + radius * (val / 5) * Math.cos(angle),
    y: CY + radius * (val / 5) * Math.sin(angle),
  }
}

function gridPt(scale: number, i: number) {
  const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5
  return `${CX + R * scale * Math.cos(angle)},${CY + R * scale * Math.sin(angle)}`
}

function gridPolygon(scale: number) {
  return Array.from({ length: 5 }, (_, i) => gridPt(scale, i)).join(' ')
}

function RadarChart({ stats }: { stats: [number, number, number, number, number] }) {
  const dataPoints = stats.map((v, i) => radarPt(v, i))
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox="0 0 180 180" className="w-[110px] h-[110px] flex-shrink-0">
      {/* Grid */}
      {[0.33, 0.67, 1].map((scale) => (
        <polygon
          key={scale}
          points={gridPolygon(scale)}
          fill="none"
          stroke="#e2ddd8"
          strokeWidth="1"
        />
      ))}
      {/* Axis lines */}
      {Array.from({ length: 5 }, (_, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5
        return (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={CX + R * Math.cos(angle)}
            y2={CY + R * Math.sin(angle)}
            stroke="#e2ddd8"
            strokeWidth="1"
          />
        )
      })}
      {/* Data area */}
      <polygon
        points={dataPolygon}
        fill="#D85A30"
        fillOpacity="0.25"
        stroke="#D85A30"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#D85A30" />
      ))}
      {/* Labels */}
      {RADAR_LABELS.map((label, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5
        const lx = CX + LR * Math.cos(angle)
        const ly = CY + LR * Math.sin(angle)
        const ta =
          Math.cos(angle) > 0.15 ? 'start' : Math.cos(angle) < -0.15 ? 'end' : 'middle'
        const db = Math.sin(angle) > 0.1 ? 'hanging' : 'auto'
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={ta}
            dominantBaseline={db}
            fontSize="9"
            fill="#6b7280"
            fontFamily="'Noto Sans KR', sans-serif"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Stat Bar ───────────────────────────────────────────────────────────────

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (value / 5) * 100)
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-10 text-[10px] text-gray-500 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#e2ddd8] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#D85A30] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-5 text-[10px] text-gray-600 text-right">{value.toFixed(1)}</span>
    </div>
  )
}

// ─── Ranking Card ────────────────────────────────────────────────────────────

function RankingCard({ item }: { item: RankingItem }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#ece9e4]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-2xl font-bold leading-none"
            style={{ color: item.rank <= 3 ? '#D85A30' : '#9ca3af' }}
          >
            #{item.rank}
          </span>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>
          </div>
        </div>
        <span className="text-[11px] text-[#0F6E56] bg-[#0F6E56]/10 px-2 py-0.5 rounded-full font-medium">
          {item.review_count}리뷰
        </span>
      </div>

      {/* Body: radar + stat bars */}
      <div className="flex gap-3 items-center">
        <RadarChart
          stats={[
            item.avg_power,
            item.avg_control,
            item.avg_repulsion,
            item.avg_durability,
            item.avg_weight,
          ]}
        />
        <div className="flex-1 flex flex-col gap-1.5">
          <StatBar label="파워" value={item.avg_power} />
          <StatBar label="컨트롤" value={item.avg_control} />
          <StatBar label="반발력" value={item.avg_repulsion} />
          <StatBar label="내구성" value={item.avg_durability} />
          <StatBar label="무게감" value={item.avg_weight} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Client Component ───────────────────────────────────────────────────

export default function RankingClient({
  initialRankings,
  defaultTier,
  defaultGender,
}: {
  initialRankings: RankingItem[]
  defaultTier: Tier
  defaultGender: Gender
}) {
  const [tier, setTier] = useState<Tier>(defaultTier)
  const [gender, setGender] = useState<Gender>(defaultGender)
  const [rankings, setRankings] = useState<RankingItem[]>(initialRankings)
  const [loading, setLoading] = useState(false)

  async function updateFilter(newTier: Tier, newGender: Gender) {
    setLoading(true)
    try {
      const data = await fetchRankings(newTier, newGender)
      setRankings(data)
    } finally {
      setLoading(false)
    }
  }

  function handleTier(t: Tier) {
    setTier(t)
    updateFilter(t, gender)
  }

  function handleGender(g: Gender) {
    setGender(g)
    updateFilter(tier, g)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Tier toggle */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TIERS.map((t) => (
          <button
            key={t}
            onClick={() => handleTier(t)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tier === t
                ? 'bg-[#D85A30] text-white'
                : 'bg-white text-gray-600 border border-[#ece9e4] hover:border-[#D85A30] hover:text-[#D85A30]'
            }`}
          >
            {t}급
          </button>
        ))}
      </div>

      {/* Gender toggle */}
      <div className="flex gap-1.5 mb-6">
        {(['M', 'F'] as Gender[]).map((g) => (
          <button
            key={g}
            onClick={() => handleGender(g)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              gender === g
                ? 'bg-[#0F6E56] text-white'
                : 'bg-white text-gray-600 border border-[#ece9e4] hover:border-[#0F6E56] hover:text-[#0F6E56]'
            }`}
          >
            {g === 'M' ? '남' : '여'}
          </button>
        ))}
      </div>

      {/* Rankings */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#D85A30] border-t-transparent animate-spin" />
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          해당 급수/성별 데이터가 없습니다
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rankings.map((item) => (
            <RankingCard key={item.equipment_id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
