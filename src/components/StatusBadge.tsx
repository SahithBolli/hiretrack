import clsx from 'clsx'
import type { AppStatus } from '../types'

const config: Record<AppStatus, { label: string; classes: string }> = {
  EVALUATED:  { label: 'Evaluated',  classes: 'bg-slate-700 text-slate-300' },
  APPLIED:    { label: 'Applied',    classes: 'bg-blue-900/50 text-blue-300' },
  RESPONDED:  { label: 'Responded',  classes: 'bg-yellow-900/50 text-yellow-300' },
  INTERVIEW:  { label: 'Interview',  classes: 'bg-purple-900/50 text-purple-300' },
  OFFER:      { label: 'Offer 🎉',   classes: 'bg-green-900/50 text-green-300' },
  REJECTED:   { label: 'Rejected',   classes: 'bg-red-900/50 text-red-400' },
  DISCARDED:  { label: 'Discarded',  classes: 'bg-slate-800 text-slate-500' },
  SKIP:       { label: 'Skip',       classes: 'bg-slate-800 text-slate-600' },
}

export default function StatusBadge({ status }: { status: AppStatus }) {
  const { label, classes } = config[status] ?? config.EVALUATED
  return <span className={clsx('badge', classes)}>{label}</span>
}
