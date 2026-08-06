import { useEffect, useState } from 'react'
import { supabase, isConfigured } from './lib/supabase'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import SetupGuide from './components/SetupGuide'

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('dh-theme') || 'light'
  )
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('dh-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (!isConfigured) return <SetupGuide />
  if (!ready) return <div className="page-loading">Loading…</div>

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return session ? (
    <Dashboard session={session} theme={theme} onToggleTheme={toggleTheme} />
  ) : (
    <AuthPage />
  )
}
