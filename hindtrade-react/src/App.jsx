import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './config/supabase'
import Index from './pages/Index'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import CADashboard from './pages/CADashboard'
import TradeCard from './pages/TradeCard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Index session={session} />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/auth" element={session ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/" replace />} />
      <Route path="/admin" element={session ? <CADashboard session={session} /> : <Navigate to="/auth" replace />} />
      <Route path="/ca" element={session ? <CADashboard session={session} /> : <Navigate to="/auth" replace />} />
      <Route path="/trade-card/:id" element={<TradeCard />} />
    </Routes>
  )
}

export default App


