import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEMO_MODE } from '../lib/config'
import { remoteApi } from '../lib/api'
import type { Customer, CustomerRegisterInput } from '../lib/types'

type Value = {
  ready: boolean
  customer: Customer | null
  logged: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: CustomerRegisterInput) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const Context = createContext<Value | null>(null)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)

  const refresh = async () => {
    if (DEMO_MODE) {
      setCustomer(null)
      setReady(true)
      return
    }
    try {
      setCustomer(await remoteApi.customerMe())
    } catch {
      setCustomer(null)
    } finally {
      setReady(true)
    }
  }

  useEffect(() => { void refresh() }, [])

  const login = async (email: string, password: string) => {
    if (DEMO_MODE) throw new Error('Login de cliente exige VITE_DEMO_MODE=false.')
    setCustomer(await remoteApi.customerLogin(email, password))
  }

  const register = async (input: CustomerRegisterInput) => {
    if (DEMO_MODE) throw new Error('Cadastro de cliente exige VITE_DEMO_MODE=false.')
    setCustomer(await remoteApi.customerRegister(input))
  }

  const logout = async () => {
    if (!DEMO_MODE) await remoteApi.customerLogout()
    setCustomer(null)
  }

  const value = useMemo(() => ({ ready, customer, logged: Boolean(customer), login, register, logout, refresh }), [ready, customer])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useCustomerAuth() {
  const value = useContext(Context)
  if (!value) throw new Error('CustomerAuthProvider ausente.')
  return value
}
