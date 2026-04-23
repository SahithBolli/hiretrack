import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applicationApi } from '../api/client'
import type { ApplicationRequest, AppStatus } from '../types'

const empty: ApplicationRequest = {
  company: '', role: '', status: 'EVALUATED', score: undefined,
  salaryRange: '', location: '', remoteOk: false, sponsorshipConfirmed: false,
  jobUrl: '', notes: '', appliedDate: '', deadlineDate: ''
}

export default function AddApplication() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<ApplicationRequest>(empty)

  const { data: existing } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationApi.getById(Number(id)),
    enabled: isEdit
  })

  useEffect(() => {
    if (existing) setForm({ ...existing } as ApplicationRequest)
  }, [existing])

  const mut = useMutation({
    mutationFn: isEdit
      ? (req: ApplicationRequest) => applicationApi.update(Number(id), req)
      : applicationApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); navigate('/applications') }
  })

  const set = (k: keyof ApplicationRequest, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Application' : 'Add Application'}</h1>
        <p className="text-slate-400 text-sm mt-1">Track a new job opportunity</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); mut.mutate(form) }} className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Company *</label>
            <input className="input" required value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. PayPal" />
          </div>
          <div>
            <label className="label">Status *</label>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value as AppStatus)}>
              {['EVALUATED','APPLIED','RESPONDED','INTERVIEW','OFFER','REJECTED','DISCARDED','SKIP'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Role *</label>
          <input className="input" required value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Senior Java Software Engineer" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Score (1–5)</label>
            <input className="input" type="number" min="1" max="5" step="0.1" value={form.score ?? ''} onChange={e => set('score', e.target.value ? Number(e.target.value) : undefined)} placeholder="4.5" />
          </div>
          <div>
            <label className="label">Salary Range</label>
            <input className="input" value={form.salaryRange ?? ''} onChange={e => set('salaryRange', e.target.value)} placeholder="$130K – $190K" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location ?? ''} onChange={e => set('location', e.target.value)} placeholder="Austin, TX" />
          </div>
          <div>
            <label className="label">Job URL</label>
            <input className="input" type="url" value={form.jobUrl ?? ''} onChange={e => set('jobUrl', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Applied Date</label>
            <input className="input" type="date" value={form.appliedDate ?? ''} onChange={e => set('appliedDate', e.target.value)} />
          </div>
          <div>
            <label className="label">Deadline</label>
            <input className="input" type="date" value={form.deadlineDate ?? ''} onChange={e => set('deadlineDate', e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={form.remoteOk ?? false} onChange={e => set('remoteOk', e.target.checked)} className="rounded" />
            Remote OK
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={form.sponsorshipConfirmed ?? false} onChange={e => set('sponsorshipConfirmed', e.target.checked)} className="rounded" />
            H-1B Sponsorship Confirmed
          </label>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input h-20 resize-none" value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Recruiter name, follow-up dates, interview tips..." />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={mut.isPending} className="btn-primary">
            {mut.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Application'}
          </button>
          <button type="button" onClick={() => navigate('/applications')} className="btn-ghost">Cancel</button>
          {mut.isError && <p className="text-red-400 text-xs">{(mut.error as Error).message}</p>}
        </div>
      </form>
    </div>
  )
}
