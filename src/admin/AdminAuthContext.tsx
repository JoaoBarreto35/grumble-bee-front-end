import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEMO_MODE } from '../lib/config'
import { remoteApi } from '../lib/api'

type AuthValue = {
  ready: boolean
  logged: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    if (DEMO_MODE) {
      setLogged(localStorage.getItem('gb_demo_admin') === '1')
      setReady(true)
      return
    }
    remoteApi.me().then(() => setLogged(true)).catch(() => setLogged(false)).finally(() => setReady(true))
  }, [])

  const login = async (email: string, password: string) => {
    if (DEMO_MODE) {
      localStorage.setItem('gb_demo_admin', '1')
      setLogged(true)
      return
    }
    await remoteApi.login(email, password)
    setLogged(true)
  }

  const logout = async () => {
    if (DEMO_MODE) localStorage.removeItem('gb_demo_admin')
    else await remoteApi.logout()
    setLogged(false)
  }

  return <Ctx.Provider value={{ ready, logged, login, logout }}>{children}</Ctx.Provider>
}

export function useAdminAuth() {
  const value = useContext(Ctx)
  if (!value) throw new Error('AdminAuthProvider ausente.')
  return value
}
