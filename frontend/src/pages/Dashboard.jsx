import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { statsApi } from '../api.js'

const PIE_COLORS = ['#FF6B00', '#FF8C33', '#FFB366', '#FFD9B3']

export default function Dashboard() {
  const [summary, setSummary] = useState({})
  const [trend, setTrend] = useState([])
  const [typeStats, setTypeStats] = useState([])
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [sum, tr, types] = await Promise.all([
        statsApi.summary(),
        statsApi.membershipTrend({ days }),
        statsApi.membershipType()
      ])
      setSummary(sum.data)
      setTrend(tr.data)
      setTypeStats(types.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [days])

  const statCards = [
    { label: '会员总数', value: summary.total_members, icon: '👥' },
    { label: '活跃会员', value: summary.active_members, icon: '✅' },
    { label: '已过期会员', value: summary.expired_members, icon: '⚠️' },
    { label: '在职教练', value: summary.total_coaches, icon: '🏋️' },
    { label: '今日课程', value: summary.today_courses, icon: '📅' },
    { label: '累计到店', value: summary.total_visits, icon: '🚶' }
  ]

  return (
    <div>
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>加载中...</div>
      ) : (
        <>
          <div className="stats-grid">
            {statCards.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-info">
                  <h3>{s.label}</h3>
                  <div className="stat-value">{s.value ?? 0}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="two-col">
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">📈 会员增长趋势</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[7, 14, 30, 90].map(d => (
                    <button
                      key={d}
                      className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setDays(d)}
                    >
                      {d}天
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={trend} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="date"
                      stroke="#666"
                      tick={{ fill: '#888', fontSize: 12 }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: '#1E1E1E',
                        border: '1px solid #333',
                        borderRadius: 8,
                        color: '#fff'
                      }}
                      labelStyle={{ color: '#FF6B00' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="会员总数"
                      stroke="#FF6B00"
                      strokeWidth={3}
                      dot={{ fill: '#FF6B00', r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="new_count"
                      name="新增会员"
                      stroke="#22C55E"
                      strokeWidth={2}
                      dot={{ fill: '#22C55E', r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">🥧 会员卡类型分布</h3>
              </div>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={typeStats}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {typeStats.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1E1E1E',
                        border: '1px solid #333',
                        borderRadius: 8,
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="pie-legend">
                {typeStats.map((t, i) => (
                  <div key={t.key} className="legend-item">
                    <span className="legend-label">
                      <span className="legend-color" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                      {t.type}
                    </span>
                    <span className="legend-value">{t.count} 人</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
