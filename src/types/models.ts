export type RoleId =
  | 'superadmin' | 'admin' | 'director' | 'docente'
  | 'estudiante' | 'analista' | 'ml' | 'auditor'

export interface Filters {
  institucion: string // 'todos' | id
  programa: string
  curso: string
  cohorte: string
  from: string // 'YYYY-MM'
  to: string
}

export interface CatalogItem { id: string; nombre: string }
export interface Catalog {
  instituciones: CatalogItem[]
  programas: CatalogItem[]
  cursos: (CatalogItem & { programaId: string })[]
  cohortes: CatalogItem[]
  meses: { id: string; label: string }[]
}

export type MonthlyKey = 'activos' | 'horas' | 'actividades' | 'evaluaciones' | 'completados' | 'certificados'
export type Row = {
  id: string
  institucionId: string
  programaId: string
  cursoId: string
  cohorteId: string
  matriculas: number
  start: number // índice del primer mes con actividad
} & Record<MonthlyKey, number[]>

export interface Kpi {
  id: 'alumnos' | 'cursos' | 'horas' | 'certificaciones' | 'finalizacion' | 'modelo'
  label: string
  value: number
  unit: '' | '%' | 'h'
  variation: number | null // % vs periodo comparable; null si no hay periodo previo
  updatedAt: string
  source: string
  definition: string
}

export interface TrendPoint { month: string; label: string; horas: number; actividades: number; evaluaciones: number }

export interface CompletionStats {
  completados: number
  enProgreso: number
  noIniciados: number
  total: number
  pctCompletados: number
}

export interface RegionProgress {
  id: string
  nombre: string
  lat: number
  lng: number
  alumnos: number
  finalizacion: number
  variation: number | null
}

export interface SkillRow {
  id: string
  name: string
  programaId: string
  estimated: number[] // % de alumnos por nivel (estimado por IA)
  validated: number[] | null // validado por docente; null = sin validar
}
export interface SkillMastery { levels: string[]; skills: SkillRow[]; note: string }

export type RecStatus = 'nueva' | 'aceptada' | 'descartada' | 'completada' | 'expirada'
export interface Recommendation {
  id: string
  text: string
  competencia: string
  motivo: string
  dificultad: 'baja' | 'media' | 'alta'
  impacto: 'bajo' | 'medio' | 'alto'
  modelVersion: string
  createdAt: string
  status: RecStatus
  useful: boolean | null
}

export interface ActivityItem {
  id: string
  kind: 'progreso' | 'evaluacion' | 'certificado' | 'recomendacion' | 'modelo'
  text: string
  at: string
  institucionId?: string
  cursoId?: string
}

export interface NotificationItem { id: string; text: string; at: string; read: boolean }
export interface AuditEntry { id: string; at: string; actor: RoleId; action: string; resource: string }

export type ModelStatus =
  | 'detenido' | 'cargando datos' | 'entrenando' | 'validando'
  | 'publicado' | 'inferencia activa' | 'error'

export type LayerGroup = 'entrada' | 'proyeccion' | 'oculta' | 'temporal' | 'salida'
export interface ModelLayer {
  id: string
  name: string
  group: LayerGroup
  neurons: number
  operation: string
  tensor: string
}

export interface ModelState {
  name: string
  version: string
  dataset: string
  status: ModelStatus
  epoch: number
  totalEpochs: number
  loss: number
  auc: number
  latencyMs: number
  updatedAt: string
  runId: string | null
  correlationId: string | null
  errorMessage: string | null
  candidate: { version: string; auc: number; loss: number } | null
  isDemo: true
  inputs: string[]
  heads: string[]
  layers: ModelLayer[]
}

export interface Db {
  rows: Row[]
  skills: SkillRow[]
  recommendations: Recommendation[]
  activity: ActivityItem[]
  notifications: NotificationItem[]
  audit: AuditEntry[]
  model: ModelState
  lastEventAt: string
}

export interface DashboardSnapshot {
  kpis: Kpi[]
  trend: TrendPoint[]
  completion: CompletionStats
  regions: RegionProgress[]
  skills: SkillMastery
  recommendations: Recommendation[]
  activity: ActivityItem[]
  notifications: NotificationItem[]
  unreadNotifications: number
  audit: AuditEntry[]
  model: ModelState
  updatedAt: string
}