import type { ReactNode } from 'react'
import { useSessionStore } from '../../stores/sessionStore'
import { can, type Perm } from '../../services/permissions'

export default function PermissionGate({ perm, children, fallback = null }: { perm: Perm; children: ReactNode; fallback?: ReactNode }) {
  const role = useSessionStore((s) => s.role)
  return <>{can(role, perm) ? children : fallback}</>
}