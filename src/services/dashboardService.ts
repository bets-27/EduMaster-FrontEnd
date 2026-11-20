import type { DashboardSnapshot, Filters, RoleId } from '../types/models'
import { db, touch } from './mockDb'
import { computeSnapshot } from './computeSnapshot'
import { can } from './permissions'
import { simulation } from './mockRealtime'

export const DASHBOARD_KEY = ['dashboard'] as const

export const snapshotNow = (f: Filters, role: RoleId): DashboardSnapshot => computeSnapshot(db, f, role)

// Latencia simulada solo en la carga inicial / cambio de filtros (para ver los estados de carga).
// Con API real, solo se cambia el cuerpo de esta función.
export async function getDashboardSnapshot(f: Filters, role: RoleId) {
  await new Promise((r) => setTimeout(r, 500))
  return snapshotNow(f, role)
}

export function logAudit(actor: RoleId, action: string, resource: string) {
  db.audit.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), actor, action, resource })
  if (db.audit.length > 30) db.audit.length = 30
  touch()
}

export type RecAction = 'aceptar' | 'descartar' | 'completar' | 'util' | 'no-util'
export function recommendationFeedback(role: RoleId, id: string, action: RecAction) {
  if (!can(role, 'reco.feedback')) throw new Error('Sin permiso: reco.feedback')
  const r = db.recommendations.find((x) => x.id === id)
  if (!r) return
  if (action === 'aceptar') r.status = 'aceptada'
  if (action === 'descartar') r.status = 'descartada'
  if (action === 'completar') r.status = 'completada'
  if (action === 'util') r.useful = true
  if (action === 'no-util') r.useful = false
  logAudit(role, `Feedback de recomendación: ${action}`, id)
}

export function requestTraining(role: RoleId) {
  if (!can(role, 'ml.train')) throw new Error('Sin permiso: ml.train')
  const ok = simulation.startTraining()
  if (ok) logAudit(role, 'Solicitud de entrenamiento', 'model')
  return ok
}

export function approveCandidate(role: RoleId) {
  if (!can(role, 'ml.approve')) throw new Error('Sin permiso: ml.approve')
  const ok = simulation.deploy()
  if (ok) logAudit(role, 'Aprobación y publicación de modelo', 'model')
  return ok
}

export function markNotificationsRead() {
  db.notifications.forEach((n) => { n.read = true })
  touch()
}