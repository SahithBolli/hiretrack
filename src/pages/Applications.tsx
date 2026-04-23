import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, ExternalLink, Trash2, Edit } from 'lucide-react'
import { applicationApi } from '../api/client'
import StatusBadge from '../components/StatusBadge'
import type { AppStatus } from '../types'

const STATUSES: AppStatus[] = ['EVALUATED','APPLIED','RESPONDED','INTERVIEW','OFFER','REJECTED','DISCARDED','SKIP']

export default function Applications() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<string>('ALL')
  const { data: apps = [], isLoading } = useQuery({ queryKey: ['applications'], queryFn: applicationApi.getAll })

  const deleteMut = useMutation({
    mutationFn: applicationApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] })
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => applicationApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] })
  })

  const filtered = filter === 'ALL' ? apps : apps.filter(a => a.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Applications</h1>
          <p className="text-slate-400 text-sm mt-1">{apps.length} total · {filtered.length} shown</p>
        </div>
        <Link to="/applications/new" className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add New
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-500 text-sm">No applications found.</p>
          <Link to="/applications/new" className="btn-primary inline-flex items-center gap-2 mt-4"><Plus size={14} /> Add Application</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(app => (
            <div key={app.id} className="card flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white">{app.company}</p>
                  {app.sponsorshipConfirmed && <span className="text-xs bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded">H-1B ✓</span>}
                  {app.remoteOk && <span className="text-xs bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">Remote</span>}
                </div>
                <p className="text-xs text-slate-400 truncate">{app.role}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  {app.salaryRange && <span className="text-xs text-slate-500">{app.salaryRange}</span>}
                  {app.location && <span className="text-xs text-slate-600">{app.location}</span>}
                  {app.deadlineDate && <span className="text-xs text-yellow-600">Due {app.deadlineDate}</span>}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {app.score && <span className="text-sm font-bold text-primary-400">{app.score}/5</span>}
                <select
                  value={app.status}
                  onChange={e => statusMut.mutate({ id: app.id!, status: e.target.value })}
                  className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <StatusBadge status={app.status} />
                {app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-primary-400 transition-colors"><ExternalLink size={14} /></a>}
                <Link to={`/applications/${app.id}/edit`} className="text-slate-500 hover:text-white transition-colors"><Edit size={14} /></Link>
                <button onClick={() => { if (confirm('Delete this application?')) deleteMut.mutate(app.id!) }} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
