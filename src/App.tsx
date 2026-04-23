import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import AddApplication from './pages/AddApplication'
import SponsorCheck from './pages/SponsorCheck'
import ScoreJob from './pages/ScoreJob'
import Analytics from './pages/Analytics'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="applications/new" element={<AddApplication />} />
        <Route path="applications/:id/edit" element={<AddApplication />} />
        <Route path="sponsor" element={<SponsorCheck />} />
        <Route path="score" element={<ScoreJob />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}
