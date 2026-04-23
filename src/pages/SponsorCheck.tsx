import { useState } from 'react'
import { Shield, Search, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { sponsorApi } from '../api/client'
import type { SponsorResult } from '../types'

const tierColor = { HIGH: 'text-green-400', MEDIUM: 'text-yellow-400', LOW: 'text-orange-400' }
const tierBg   = { HIGH: 'bg-green-900/30 border-green-800', MEDIUM: 'bg-yellow-900/30 border-yellow-800', LOW: 'bg-orange-900/30 border-orange-800' }

export default function SponsorCheck() {
  const [company, setCompany] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState<SponsorResult | null>(null)
  const [jdResult, setJdResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const checkCompany = async () => {
    if (!company.trim()) return
    setLoading(true)
    try { setResult(await sponsorApi.check(company)) } finally { setLoading(false) }
  }

  const checkJd = async () => {
    if (!jd.trim()) return
    setLoading(true)
    try { setJdResult(await sponsorApi.checkJd(jd)) } finally { setLoading(false) }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield size={22} className="text-purple-400" /> H-1B Sponsor Check</h1>
        <p className="text-slate-400 text-sm mt-1">Check if a company sponsors H-1B visas — powered by DOL OFLC data</p>
      </div>

      {/* Company checker */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-white">Check a Company</h2>
        <div className="flex gap-3">
          <input className="input flex-1" value={company} onChange={e => setCompany(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkCompany()}
            placeholder="e.g. PayPal, Salesforce, Amazon..." />
          <button onClick={checkCompany} disabled={loading} className="btn-primary flex items-center gap-2 shrink-0">
            <Search size={14} /> {loading ? '...' : 'Check'}
          </button>
        </div>

        {result && (
          <div className={`rounded-xl border p-4 ${result.knownSponsor ? tierBg[result.tier ?? 'LOW'] : 'bg-slate-800 border-slate-700'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.knownSponsor
                ? <CheckCircle size={20} className={tierColor[result.tier ?? 'LOW']} />
                : <XCircle size={20} className="text-slate-400" />}
              <div>
                <p className="font-semibold text-white">{result.companyName}</p>
                {result.tier && <p className={`text-xs font-bold ${tierColor[result.tier]}`}>{result.tier} SPONSOR</p>}
              </div>
              {result.totalH1bApprovals && (
                <div className="ml-auto text-right">
                  <p className="text-xl font-bold text-white">{result.totalH1bApprovals.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">H-1B approvals/yr</p>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-300">{result.recommendation}</p>
          </div>
        )}
      </div>

      {/* JD scanner */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-white">Scan a Job Description</h2>
        <p className="text-xs text-slate-500">Paste the JD text — detects "no sponsorship", "US citizens only", "H-1B welcome", etc.</p>
        <textarea className="input h-32 resize-none" value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste full job description here..." />
        <button onClick={checkJd} disabled={loading} className="btn-primary flex items-center gap-2">
          <Search size={14} /> Scan JD
        </button>

        {jdResult && (
          <div className={`rounded-xl border p-4 ${
            jdResult.signal === 'NO_SPONSORSHIP' ? 'bg-red-900/30 border-red-800' :
            jdResult.signal === 'SPONSORS' ? 'bg-green-900/30 border-green-800' :
            'bg-slate-800 border-slate-700'}`}>
            <div className="flex items-center gap-2 mb-2">
              {jdResult.signal === 'SPONSORS' ? <CheckCircle size={16} className="text-green-400" /> :
               jdResult.signal === 'NO_SPONSORSHIP' ? <XCircle size={16} className="text-red-400" /> :
               <HelpCircle size={16} className="text-slate-400" />}
              <p className="text-sm font-semibold text-white">{String(jdResult.signal)}</p>
              {Number(jdResult.scoreAdjustment) !== 0 && (
                <span className={`text-xs ml-auto font-bold ${Number(jdResult.scoreAdjustment) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(jdResult.scoreAdjustment) > 0 ? '+' : ''}{String(jdResult.scoreAdjustment)} score
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300">{String(jdResult.message)}</p>
          </div>
        )}
      </div>

      {/* Top sponsors quick list */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-3">Known Top Sponsors for Java Roles</h2>
        <div className="flex flex-wrap gap-2">
          {['Amazon','Google','Microsoft','Cognizant','Infosys','TCS','Wipro','Capital One','JPMorgan','Salesforce','IBM','PayPal','Honeywell','Oracle','American Express'].map(c => (
            <button key={c} onClick={() => { setCompany(c); sponsorApi.check(c).then(setResult) }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
