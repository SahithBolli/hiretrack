import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, ExternalLink, Trash2, Edit, FileText, Download, X } from 'lucide-react'
import { applicationApi } from '../api/client'
import StatusBadge from '../components/StatusBadge'
import type { AppStatus } from '../types'

const STATUSES: AppStatus[] = ['EVALUATED','APPLIED','RESPONDED','INTERVIEW','OFFER','REJECTED','DISCARDED','SKIP']

export default function Applications() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<string>('ALL')
  const { data: apps = [], isLoading } = useQuery({ queryKey: ['applications'], queryFn: applicationApi.getAll })

  const [expanded, setExpanded] = useState<number | null>(null)
  const [coverModal, setCoverModal] = useState<{ text: string; company: string } | null>(null)

  const deleteMut = useMutation({
    mutationFn: applicationApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] })
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => applicationApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] })
  })

  const deleteResumeMut = useMutation({
    mutationFn: (id: number) => applicationApi.deleteResume(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] })
  })

  const deleteCoverMut = useMutation({
    mutationFn: (id: number) => applicationApi.deleteCover(id),
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
            <div key={app.id} className="card">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-white">{app.company}</p>
                    {app.sponsorshipConfirmed && <span className="text-xs bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded">H-1B ✓</span>}
                    {app.remoteOk && <span className="text-xs bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">Remote</span>}
                    {(app.resumeBase64 || app.coverLetter) && (
                      <button onClick={() => setExpanded(expanded === app.id ? null : app.id!)}
                        className="text-xs bg-primary-900/30 text-primary-400 px-1.5 py-0.5 rounded hover:bg-primary-900/50 transition-colors">
                        <FileText size={10} className="inline mr-1" />Files
                      </button>
                    )}
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

              {/* Resume + Cover Letter panel */}
              {expanded === app.id && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-3">
                  {app.resumeBase64 && (
                    <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                      <FileText size={13} className="text-primary-400 shrink-0" />
                      <span className="text-xs text-slate-300">{app.resumeFileName || 'resume.pdf'}</span>
                      <a href={applicationApi.downloadResume(app.id!)} download
                        className="text-primary-400 hover:text-primary-300 transition-colors ml-1">
                        <Download size={13} />
                      </a>
                      <button onClick={() => { if (confirm('Delete resume file? (Application stays)')) deleteResumeMut.mutate(app.id!) }}
                        className="text-slate-600 hover:text-red-400 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  )}
                  {app.coverLetter && (
                    <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                      <FileText size={13} className="text-green-400 shrink-0" />
                      <span className="text-xs text-slate-300">Cover Letter</span>
                      <button onClick={() => setCoverModal({ text: app.coverLetter!, company: app.company })}
                        className="text-green-400 hover:text-green-300 text-xs transition-colors ml-1">View</button>
                      <button
                        onClick={() => {
                          const blob = new Blob([app.coverLetter!], { type: 'text/plain' })
                          const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                          a.download = `${app.company}-cover-letter.txt`; a.click()
                        }}
                        className="text-green-400 hover:text-green-300 transition-colors">
                        <Download size={13} />
                      </button>
                      <button onClick={() => { if (confirm('Delete cover letter? (Application stays)')) deleteCoverMut.mutate(app.id!) }}
                        className="text-slate-600 hover:text-red-400 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Cover letter modal */}
          {coverModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setCoverModal(null)}>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Cover Letter — {coverModal.company}</h3>
                  <button onClick={() => setCoverModal(null)} className="text-slate-500 hover:text-white"><X size={16} /></button>
                </div>
                <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{coverModal.text}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
