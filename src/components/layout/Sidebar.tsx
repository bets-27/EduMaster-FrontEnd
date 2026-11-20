import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import {
  Award, BarChart3, BookOpen, Bot, ClipboardCheck, GraduationCap,
  LayoutDashboard, PlayCircle, Settings, Users, type LucideIcon,
} from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'
import { useSessionStore } from '../../stores/sessionStore'
import { can, type Perm } from '../../services/permissions'

const items: { to: string; label: string; icon: LucideIcon; perm: Perm }[] = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, perm: 'mod.resumen' },
  { to: '/planes', label: 'Planes de Aprendizaje', icon: BookOpen, perm: 'mod.planes' },
  { to: '/cursos', label: 'Cursos', icon: PlayCircle, perm: 'mod.cursos' },
  { to: '/analisis', label: 'Análisis', icon: BarChart3, perm: 'mod.analisis' },
  { to: '/ia-tutor', label: 'IA Tutor', icon: Bot, perm: 'mod.ia-tutor' },
  { to: '/evaluaciones', label: 'Evaluaciones', icon: ClipboardCheck, perm: 'mod.evaluaciones' },
  { to: '/certificados', label: 'Certificados', icon: Award, perm: 'mod.certificados' },
  { to: '/comunidad', label: 'Comunidad', icon: Users, perm: 'mod.comunidad' },
  { to: '/administracion', label: 'Administración', icon: Settings, perm: 'mod.administracion' },
]

export default function Sidebar() {
  const open = useUiStore((s) => s.sidebarOpen)
  const close = useUiStore((s) => s.closeSidebar)
  const role = useSessionStore((s) => s.role)

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={close} />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-brand/30 bg-panel p-4 transition-transform',
          'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-6 flex items-center gap-2 px-2">
          <GraduationCap className="text-neon" size={28} />
          <span className="text-lg font-bold">EduMaster<span className="text-neon">.ai</span></span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {items.filter((i) => can(role, i.perm)).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={close}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-brand text-white' : 'text-muted hover:bg-panel2 hover:text-title',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="px-2 text-xs text-muted">Datos simulados · DEMO</p>
      </aside>
    </>
  )
}