export type AppStatus = 'EVALUATED' | 'APPLIED' | 'RESPONDED' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'DISCARDED' | 'SKIP'

export interface Application {
  id: number
  company: string
  role: string
  status: AppStatus
  score?: number
  salaryRange?: string
  location?: string
  remoteOk?: boolean
  sponsorshipConfirmed?: boolean
  jobUrl?: string
  notes?: string
  appliedDate?: string
  deadlineDate?: string
  createdAt?: string
}

export interface ApplicationRequest {
  company: string
  role: string
  status: AppStatus
  score?: number
  salaryRange?: string
  location?: string
  remoteOk?: boolean
  sponsorshipConfirmed?: boolean
  jobUrl?: string
  notes?: string
  appliedDate?: string
  deadlineDate?: string
}

export interface SponsorResult {
  companyName: string
  knownSponsor: boolean
  tier?: 'HIGH' | 'MEDIUM' | 'LOW'
  totalH1bApprovals?: number
  state?: string
  recommendation: string
}

export interface Analytics {
  totalApplications: number
  byStatus: Record<string, number>
  averageScore: number
  sponsoredCount: number
  upcomingDeadlines: number
  responseRate: number
  interviewRate: number
  deadlineAlerts: Array<{
    company: string
    role: string
    deadline: string
    daysLeft: number
    score: number
  }>
}

export interface JobScoreResult {
  globalScore: number
  levelClassification: string
  levelExcluded: boolean
  sponsorsH1b?: boolean
  recommendation: string
  redFlags?: string[]
  extractedKeywords?: string[]
}
