import { useState } from 'react'
import { Zap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { jobApi } from '../api/client'
import type { JobScoreResult } from '../types'

export default function ScoreJob() {
  const [form, setForm] = useState({ jobUrl: '', company: '', role: '', location: '', salaryRange: '', yearsRequired: '', jdText: '' })
  const [result, setResult] = useState<JobScoreResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const payload = { ...form, yearsRequired: form.yearsRequired ? Number(form.yearsRequired) : undefined }
      setResult(await jobApi.score(payload))
    } catch (err: unknown) { setError('Failed to score job. Make sure the backend is running.') }
    finally { setLoading(false) }
  }

  const scoreColor = (s: number) => s >= 4.5 ? 'text-green-400' : s >= 4 ? 'text-primary-400' : s >= 3.5 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Zap size={22} className="text-primary-400" /> Score a Job</h1>
        <p className="text-slate-400 text-sm mt-1">Check if a role is worth applying to — level filter + H-1B check + skill match</p>
      </div>

      <form onSubmit={submit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Company *</label>
            <input className="input" required value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} placeholder="PayPal" />
          </div>
          <div>
            <label className="label">Job Title *</label>
            <input className="input" required value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} placeholder="Senior Java Software Engineer" />
          </div>
        </div>
        <div>
          <label className="label">Job URL *</label>
          <input className="input" required type="url" value={form.jobUrl} onChange={e => setForm(f => ({...f, jobUrl: e.target.value}))} placeholder="https://..." />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} placeholder="Austin, TX" />
          </div>
          <div>
            <label className="label">Salary Range</label>
            <input className="input" value={form.salaryRange} onChange={e => setForm(f => ({...f, salaryRange: e.target.value}))} placeholder="$130K-$190K" />
          </div>
          <div>
            <label className="label">Years Required</label>
            <input className="input" type="number" value={form.yearsRequired} onChange={e => setForm(f => ({...f, yearsRequired: e.target.value}))} placeholder="5" />
          </div>
        </div>
        <div>
          <label className="label">Job Description (paste full text for best results)</label>
          <textarea className="input h-36 resize-none" value={form.jdText} onChange={e => setForm(f => ({...f, jdText: e.target.value}))} placeholder="Paste the full job description here..." />
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <Zap size={14} /> {loading ? 'Scoring...' : 'Score this Job'}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </form>

      {result && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Score Result</h2>
            <span className={`text-4xl font-black ${scoreColor(result.globalScore)}`}>{result.globalScore}<span className="text-lg text-slate-500">/5</span></span>
          </div>

          {result.levelExcluded && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 flex items-center gap-2">
              <XCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-300">Level excluded — role is {result.levelClassification}, above target (Entry/Mid/Senior only)</p>
            </div>
          )}

          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Recommendation</p>
            <p className="text-sm font-medium text-white">{result.recommendation}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Level</p>
              <p className="text-sm font-medium text-white">{result.levelClassification}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">H-1B Sponsorship</p>
              <div className="flex items-center gap-1.5">
                {result.sponsorsH1b === true ? <CheckCircle size={14} className="text-green-400" /> : result.sponsorsH1b === false ? <XCircle size={14} className="text-red-400" /> : <AlertTriangle size={14} className="text-yellow-400" />}
                <p className="text-sm font-medium text-white">{result.sponsorsH1b === true ? 'Known sponsor' : result.sponsorsH1b === false ? 'Not confirmed' : 'Unknown'}</p>
              </div>
            </div>
          </div>

          {(result.redFlags?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">Red Flags</p>
              {result.redFlags!.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-red-300 py-1"><XCircle size={12} className="shrink-0" />{f}</div>
              ))}
            </div>
          )}

          {(result.extractedKeywords?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">Matched Keywords ({result.extractedKeywords!.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {result.extractedKeywords!.map(k => <span key={k} className="text-xs bg-primary-600/20 text-primary-400 border border-primary-600/30 px-2 py-0.5 rounded">{k}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
