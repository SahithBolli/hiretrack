import axios from 'axios'
import type { Application, ApplicationRequest, Analytics, SponsorResult, JobScoreResult } from '../types'

const BASE = import.meta.env.VITE_API_BASE ? `${import.meta.env.VITE_API_BASE}/api` : '/api'
const api = axios.create({ baseURL: BASE })

export const applicationApi = {
  getAll: () => api.get<Application[]>('/applications').then(r => r.data),
  getById: (id: number) => api.get<Application>(`/applications/${id}`).then(r => r.data),
  create: (req: ApplicationRequest) => api.post<Application>('/applications', req).then(r => r.data),
  update: (id: number, req: ApplicationRequest) => api.put<Application>(`/applications/${id}`, req).then(r => r.data),
  updateStatus: (id: number, status: string) => api.patch<Application>(`/applications/${id}/status?status=${status}`).then(r => r.data),
  delete: (id: number) => api.delete(`/applications/${id}`),
  analytics: () => api.get<Analytics>('/applications/analytics').then(r => r.data),
  downloadResume: (id: number) => `${api.defaults.baseURL}/applications/${id}/resume`,
  deleteResume: (id: number) => api.delete(`/applications/${id}/resume`),
  deleteCover: (id: number) => api.delete(`/applications/${id}/cover`),
}

export const sponsorApi = {
  check: (company: string) => api.get<SponsorResult>(`/sponsors/check?company=${encodeURIComponent(company)}`).then(r => r.data),
  search: (keyword: string) => api.get(`/sponsors/search?keyword=${encodeURIComponent(keyword)}`).then(r => r.data),
  topSponsors: () => api.get(`/sponsors/top`).then(r => r.data),
  byState: (state: string) => api.get(`/sponsors/state/${state}`).then(r => r.data),
  checkJd: (jdText: string) => api.post(`/sponsors/check-jd`, { jdText }).then(r => r.data),
}

export const jobApi = {
  score: (payload: object) => api.post<JobScoreResult>('/jobs/score', payload).then(r => r.data),
  importFromUrl: (url: string) => api.post<Application>('/jobs/import-url', { url }).then(r => r.data),
  checkLevel: (title: string) => api.get(`/jobs/check-level?title=${encodeURIComponent(title)}`).then(r => r.data),
  topJobs: (minScore = 4.0) => api.get(`/jobs/top?minScore=${minScore}`).then(r => r.data),
  sponsored: () => api.get('/jobs/sponsored').then(r => r.data),
}
