import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, Briefcase, Shield, CheckCircle } from 'lucide-react'
import { applicationApi } from '../api/client'

const STATUS_COLORS: Record<string, string> = {
  EVALUATED: '#6366f1', APPLIED: '#3b82f6', RESPONDED: '#8b5cf6',
  INTERVIEW: '#f59e0b', OFFER: '#10b981', REJECTED: '#ef4444',
  DISCARDED: '#6b7280', SKIP: '#374151'
}

export default function Analytics() {
  const { data: apps = [] } = useQuery({ queryKey: ['applications'], queryFn: applicationApi.getAll })
  const { data: analytics } = useQuery({ queryKey: ['analytics'], queryFn: applicationApi.analytics })

  const statusCounts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  const scoreBuckets = [
    { range: '4.5–5.0', count: apps.filter(a => (a.score ?? 0) >= 4.5).length },
    { range: '4.0–4.4', count: apps.filter(a => (a.score ?? 0) >= 4.0 && (a.score ?? 0) < 4.5).length },
    { range: '3.5–3.9', count: apps.filter(a => (a.score ?? 0) >= 3.5 && (a.score ?? 0) < 4.0).length },
    { range: '<3.5',    count: apps.filter(a => (a.score ?? 0) > 0 && (a.score ?? 0) < 3.5).length },
  ]

  const sponsored = apps.filter(a => a.sponsorshipConfirmed).length
  const offers     = apps.filter(a => a.status === 'OFFER').length
  const interviews = apps.filter(a => a.status === 'INTERVIEW').length
  const applied    = apps.filter(a => !['EVALUATED','DISCARDED','SKIP'].includes(a.status)).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp size={22} className="text-green-400" /> Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Pipeline funnel, score distribution, and sponsorship breakdown</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Applied', value: applied, icon: Briefcase, color: 'text-primary-400' },
          { label: 'Interviews', value: interviews, icon: CheckCircle, color: 'text-yellow-400' },
          { label: 'Offers', value: offers, icon: CheckCircle, color: 'text-green-400' },
          { label: 'H-1B Confirmed', value: sponsored, icon: Shield, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs font-medium">{label}</p>
              <Icon size={15} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Status Breakdown</h2>
          {pieData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Score distribution */}
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Score Distribution</h2>
          {apps.every(a => !a.score) ? (
            <p className="text-slate-500 text-sm text-center py-10">No scored applications yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={scoreBuckets} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: '#1e293b' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Funnel metrics */}
      {analytics && (
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Funnel Rates</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-primary-400">{analytics.responseRate ?? 0}%</p>
              <p className="text-xs text-slate-500 mt-1">Response Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-yellow-400">{analytics.interviewRate ?? 0}%</p>
              <p className="text-xs text-slate-500 mt-1">Interview Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-green-400">{offers}</p>
              <p className="text-xs text-slate-500 mt-1">Total Offers</p>
            </div>
          </div>
        </div>
      )}

      {/* Top companies */}
      {apps.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">All Applications by Company</h2>
          <div className="space-y-2">
            {Object.entries(
              apps.reduce<Record<string, { count: number; statuses: string[] }>>((acc, a) => {
                if (!acc[a.company]) acc[a.company] = { count: 0, statuses: [] }
                acc[a.company].count++
                acc[a.company].statuses.push(a.status)
                return acc
              }, {})
            ).sort((a, b) => b[1].count - a[1].count).map(([company, { count, statuses }]) => (
              <div key={company} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                <p className="text-sm text-white">{company}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{count} application{count > 1 ? 's' : ''}</span>
                  <div className="flex gap-1">
                    {statuses.map((s, i) => (
                      <span key={i} className="w-2 h-2 rounded-full inline-block" style={{ background: STATUS_COLORS[s] ?? '#6b7280' }} title={s} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
