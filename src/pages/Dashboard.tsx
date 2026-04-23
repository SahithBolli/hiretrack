import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Briefcase, Shield, TrendingUp, AlertCircle, Plus, Sparkles, CheckCircle } from 'lucide-react'
import { applicationApi, jobApi } from '../api/client'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const qc = useQueryClient()
  const { data: apps = [] } = useQuery({ queryKey: ['applications'], queryFn: applicationApi.getAll })
  const { data: analytics } = useQuery({ queryKey: ['analytics'], queryFn: applicationApi.analytics })
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ company: string; role: string; score?: number } | null>(null)
  const [importError, setImportError] = useState('')

  const handleImport = async () => {
    if (!importUrl.trim()) return
    setImporting(true); setImportError(''); setImportResult(null)
    try {
      const app = await jobApi.importFromUrl(importUrl)
      setImportResult({ company: app.company, role: app.role, score: app.score })
      setImportUrl('')
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    } catch {
      setImportError('Import failed. Check backend is running and keys are set.')
    } finally { setImporting(false) }
  }

  const stats = [
    { label: 'Total Applications', value: analytics?.totalApplications ?? 0, icon: Briefcase, color: 'text-primary-400' },
    { label: 'Sponsored',          value: analytics?.sponsoredCount ?? 0,     icon: Shield,   color: 'text-purple-400' },
    { label: 'Response Rate',      value: `${analytics?.responseRate ?? 0}%`,  icon: TrendingUp, color: 'text-green-400' },
    { label: 'Deadlines This Week',value: analytics?.upcomingDeadlines ?? 0,  icon: AlertCircle, color: 'text-yellow-400' },
  ]

  const recent = [...apps].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)).slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Your STEM OPT job search pipeline</p>
        </div>
        <Link to="/applications/new" className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add Application
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs font-medium">{label}</p>
              <Icon size={15} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* AI Import */}
      <div className="card border-primary-800/50">
        <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <Sparkles size={14} className="text-primary-400" /> AI Job Import
        </h2>
        <p className="text-xs text-slate-500 mb-3">Paste any job URL — AI fetches, scores, and saves it automatically</p>
        <div className="flex gap-3">
          <input
            className="input flex-1"
            value={importUrl}
            onChange={e => setImportUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleImport()}
            placeholder="https://jobs.lever.co/... or LinkedIn/Indeed/Greenhouse URL"
          />
          <button onClick={handleImport} disabled={importing} className="btn-primary flex items-center gap-2 shrink-0">
            <Sparkles size={14} /> {importing ? 'Importing...' : 'Import'}
          </button>
        </div>
        {importResult && (
          <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
            <CheckCircle size={13} />
            <span>Saved: <strong>{importResult.company}</strong> — {importResult.role} {importResult.score ? `(${importResult.score}/5)` : ''}</span>
          </div>
        )}
        {importError && <p className="text-red-400 text-xs mt-2">{importError}</p>}
      </div>

      {/* Deadline alerts */}
      {(analytics?.deadlineAlerts?.length ?? 0) > 0 && (
        <div className="card border-yellow-900/50">
          <h2 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2"><AlertCircle size={14} /> Upcoming Deadlines</h2>
          <div className="space-y-2">
            {analytics!.deadlineAlerts.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{a.company}</p>
                  <p className="text-xs text-slate-500">{a.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-yellow-400">{a.daysLeft} days left</p>
                  <p className="text-xs text-slate-600">{a.deadline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent applications */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Applications</h2>
          <Link to="/applications" className="text-xs text-primary-400 hover:text-primary-300">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm">No applications yet.</p>
            <Link to="/applications/new" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Plus size={14} /> Add your first application
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(app => (
              <div key={app.id} className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{app.company}</p>
                  <p className="text-xs text-slate-500 truncate">{app.role}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  {app.score && <span className="text-xs font-bold text-primary-400">{app.score}/5</span>}
                  {app.sponsorshipConfirmed && <span className="text-xs text-purple-400">✓ H-1B</span>}
                  <StatusBadge status={app.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
