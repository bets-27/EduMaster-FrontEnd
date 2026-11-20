import type { ReactNode } from 'react'
import { useSessionStore } from '../../stores/sessionStore'
import { can, type Perm } from '../../services/permissions'
import Card from './Card'

export default function RoleGuard({ perm, children }: { perm: Perm; children: ReactNode }) {
  const role = useSessionStore((s) => s.role)
  if (can(role, perm)) return <>{children}</>
  return (
    <Card title="Acceso restringido">
      <p className="text-sm text-muted">Tu rol actual no tiene permiso para este módulo (403 simulado).</p>
    </Card>
  )
}