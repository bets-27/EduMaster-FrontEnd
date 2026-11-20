import { Bell, Menu, Pause, Play } from 'lucide-react'
import clsx from 'clsx'
import { useDashboard } from '../../hooks/useDashboard'
import { useConnection } from '../../hooks/useRealtime'
import { simulation } from '../../services/mockRealtime'
import { ROLES } from '../../services/permissions'
import { useSessionStore } from '../../stores/sessionStore'
import { useUiStore } from '../../stores/uiStore'
import type { RoleId } from '../../types/models'

const hora = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString('es-PE') : '—')

export default function Topbar() {
  const unread = useDashboard((s) => s.unreadNotifications).data ?? 0
  const conn = useConnection()
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const { role, setRole } = useSessionStore()
  const live = conn.status === 'en-vivo'

  const label =
    conn.status === 'en-vivo' ? 'En vivo · simulación'
    : conn.status === 'pausado' ? `Pausado · última act. ${hora(conn.lastEventAt)}`
    : `Sin conexión · última act. ${hora(conn.lastEventAt)}`

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-brand/30 bg-navy/90 px-4 py-3 backdrop-blur">
      <button className="lg:hidden" onClick={toggleSidebar} aria-label="Abrir menú">
        <Menu />
      </button>
      <p className="hidden text-sm font-semibold sm:block">Aprende • Practica • Destaca</p>

      <div className="ml-auto flex items-center gap-3">
        <span className="rounded-full border border-accent/50 px-2 py-0.5 text-xs text-accent">DEMO</span>

        <div className="flex items-center gap-2 rounded-full border border-brand/30 bg-panel px-3 py-1 text-xs">
          <span className={clsx('h-2 w-2 rounded-full', live ? 'bg-ok animate-pulse' : 'bg-warn')} />
          <span className="hidden md:inline">{label}</span>
          <button
            onClick={() => (live ? simulation.pause() : simulation.start())}
            aria-label={live ? 'Pausar simulación' : 'Reanudar simulación'}
            className="text-neon"
          >
            {live ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-muted">
          <span className="hidden sm:inline">Rol</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as RoleId)}
            className="rounded-xl border border-brand/30 bg-panel px-2 py-1.5 text-sm text-title outline-none focus:border-neon"
            aria-label="Cambiar rol (simulado)"
          >
            {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </label>

        <button className="relative" aria-label="Notificaciones">
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-accent px-1.5 text-[10px] font-bold">{unread}</span>
          )}
        </button>
      </div>
    </header>
  )
}