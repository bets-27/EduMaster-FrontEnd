import { create } from 'zustand'
import type { RoleId } from '../types/models'

interface SessionState {
  role: RoleId
  setRole: (r: RoleId) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  role: 'superadmin',
  setRole: (role) => set({ role }),
}))