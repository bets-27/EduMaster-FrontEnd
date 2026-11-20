import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import RoleGuard from './components/ui/RoleGuard'
import DashboardPage from './modules/dashboard/DashboardPage'
import { useRealtime } from './hooks/useRealtime'
import type { Perm } from './services/permissions'

function Pendiente({ titulo, perm }: { titulo: string; perm: Perm }): ReactNode {
  return (
    <RoleGuard perm={perm}>
      <h1 className="text-xl font-semibold text-title">{titulo}</h1>
      <p className="mt-2 text-muted">Módulo en construcción · DEMO</p>
    </RoleGuard>
  )
}

export default function App() {
  useRealtime()

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<RoleGuard perm="mod.resumen"><DashboardPage /></RoleGuard>} />
        <Route path="/planes" element={<Pendiente perm="mod.planes" titulo="Planes de Aprendizaje" />} />
        <Route path="/cursos" element={<Pendiente perm="mod.cursos" titulo="Cursos" />} />
        <Route path="/analisis" element={<Pendiente perm="mod.analisis" titulo="Análisis" />} />
        <Route path="/ia-tutor" element={<Pendiente perm="mod.ia-tutor" titulo="IA Tutor" />} />
        <Route path="/evaluaciones" element={<Pendiente perm="mod.evaluaciones" titulo="Evaluaciones" />} />
        <Route path="/certificados" element={<Pendiente perm="mod.certificados" titulo="Certificados" />} />
        <Route path="/comunidad" element={<Pendiente perm="mod.comunidad" titulo="Comunidad" />} />
        <Route path="/administracion" element={<Pendiente perm="mod.administracion" titulo="Administración" />} />
      </Route>
    </Routes>
  )
}