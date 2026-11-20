import type { RoleId } from '../types/models'

export type Perm =
  | 'mod.resumen' | 'mod.planes' | 'mod.cursos' | 'mod.analisis' | 'mod.ia-tutor'
  | 'mod.evaluaciones' | 'mod.certificados' | 'mod.comunidad' | 'mod.administracion'
  | 'panel.neural' | 'panel.skills' | 'panel.map' | 'panel.reco' | 'panel.activity'
  | 'reco.feedback' | 'ml.train' | 'ml.approve' | 'export' | 'audit.read'

export const ROLES: { id: RoleId; label: string }[] = [
  { id: 'superadmin', label: 'Superadministrador' },
  { id: 'admin', label: 'Administrador institucional' },
  { id: 'director', label: 'Director / coordinador' },
  { id: 'docente', label: 'Docente' },
  { id: 'estudiante', label: 'Estudiante' },
  { id: 'analista', label: 'Analista de datos' },
  { id: 'ml', label: 'ML Engineer' },
  { id: 'auditor', label: 'Auditor' },
]

const ALL: Perm[] = [
  'mod.resumen', 'mod.planes', 'mod.cursos', 'mod.analisis', 'mod.ia-tutor',
  'mod.evaluaciones', 'mod.certificados', 'mod.comunidad', 'mod.administracion',
  'panel.neural', 'panel.skills', 'panel.map', 'panel.reco', 'panel.activity',
  'reco.feedback', 'ml.train', 'ml.approve', 'export', 'audit.read',
]

const MATRIX: Record<RoleId, Perm[]> = {
  superadmin: ALL,
  admin: ALL.filter((p) => p !== 'ml.train'),
  director: ['mod.resumen', 'mod.planes', 'mod.cursos', 'mod.analisis', 'mod.certificados', 'mod.comunidad',
    'panel.skills', 'panel.map', 'panel.reco', 'panel.activity', 'export'],
  docente: ['mod.resumen', 'mod.cursos', 'mod.analisis', 'mod.ia-tutor', 'mod.evaluaciones', 'mod.comunidad',
    'panel.skills', 'panel.reco', 'panel.activity', 'reco.feedback'],
  estudiante: ['mod.resumen', 'mod.planes', 'mod.cursos', 'mod.ia-tutor', 'mod.evaluaciones', 'mod.certificados',
    'mod.comunidad', 'panel.skills', 'panel.reco', 'panel.activity', 'reco.feedback'],
  analista: ['mod.resumen', 'mod.analisis', 'panel.neural', 'panel.skills', 'panel.map', 'panel.activity', 'export'],
  ml: ['mod.resumen', 'mod.analisis', 'panel.neural', 'panel.skills', 'ml.train'],
  auditor: ['mod.resumen', 'mod.administracion', 'panel.activity', 'audit.read'],
}

export const can = (role: RoleId, perm: Perm) => MATRIX[role].includes(perm)

// ABAC simulado: el docente solo ve sus cursos asignados
export const DOCENTE_CURSOS = ['ds-python', 'dev-web']