import type { Db } from '../types/models'
import type { DomainEvent } from '../types/events'
import { CATALOG } from './catalog'

const LAST = CATALOG.meses.length - 1
const curso = (id: string) => CATALOG.cursos.find((c) => c.id === id)?.nombre ?? id

function push<T>(list: T[], item: T, max: number) {
  list.unshift(item)
  if (list.length > max) list.length = max
}

export function applyEvent(db: Db, e: DomainEvent): void {
  const at = e.occurred_at
  db.lastEventAt = at

  switch (e.event_type) {
    case 'learning.progress.updated': {
      const p = e.payload
      const r = db.rows.find((x) => x.id === p.rowId)
      if (!r) return
      r.activos[LAST] = Math.min(r.matriculas, r.activos[LAST] + p.activosDelta)
      r.horas[LAST] += p.horasDelta
      r.actividades[LAST] += p.actividadesDelta
      push(db.activity, { id: e.event_id, kind: 'progreso', at, institucionId: p.institucionId, cursoId: p.cursoId, text: `${p.estudiante} avanzó en ${curso(p.cursoId)}` }, 30)
      return
    }
    case 'assessment.submitted': {
      const p = e.payload
      const r = db.rows.find((x) => x.id === p.rowId)
      if (!r) return
      r.evaluaciones[LAST] += 1
      push(db.activity, { id: e.event_id, kind: 'evaluacion', at, institucionId: p.institucionId, cursoId: p.cursoId, text: `${p.estudiante} ${p.aprobado ? 'aprobó' : 'entregó'} evaluación de ${curso(p.cursoId)}` }, 30)
      return
    }
    case 'course.completed': {
      const p = e.payload
      const r = db.rows.find((x) => x.id === p.rowId)
      if (!r) return
      r.completados[LAST] += 1
      r.certificados[LAST] += 1
      push(db.activity, { id: e.event_id, kind: 'certificado', at, institucionId: p.institucionId, cursoId: p.cursoId, text: `Certificado emitido a ${p.estudiante} · ${curso(p.cursoId)}` }, 30)
      return
    }
    case 'recommendation.created':
      push(db.recommendations, { ...e.payload, modelVersion: db.model.version, createdAt: at, status: 'nueva', useful: null }, 8)
      return
    case 'notification.created':
      push(db.notifications, { id: e.payload.id, text: e.payload.text, at, read: false }, 20)
      return
    case 'model.training.started':
      db.model = { ...db.model, status: 'cargando datos', runId: e.payload.runId, correlationId: e.payload.correlationId, epoch: 0, totalEpochs: e.payload.totalEpochs, loss: 0.9, auc: 0.5, errorMessage: null, updatedAt: at }
      push(db.activity, { id: e.event_id, kind: 'modelo', at, text: 'Entrenamiento iniciado (simulado)' }, 30)
      return
    case 'model.training.progress':
      db.model = { ...db.model, status: e.payload.status, epoch: e.payload.epoch, loss: e.payload.loss, auc: e.payload.auc, updatedAt: at }
      return
    case 'model.training.completed':
      db.model = { ...db.model, status: 'detenido', loss: e.payload.loss, auc: db.model.auc, candidate: { version: e.payload.candidateVersion, auc: e.payload.auc, loss: e.payload.loss }, updatedAt: at }
      push(db.activity, { id: e.event_id, kind: 'modelo', at, text: `Modelo candidato ${e.payload.candidateVersion} listo para aprobación` }, 30)
      push(db.notifications, { id: `n-${e.event_id}`, text: 'Modelo candidato pendiente de aprobación', at, read: false }, 20)
      return
    case 'model.training.failed':
      db.model = { ...db.model, status: 'error', errorMessage: e.payload.message, correlationId: e.payload.correlationId, updatedAt: at }
      push(db.activity, { id: e.event_id, kind: 'modelo', at, text: 'Entrenamiento fallido' }, 30)
      return
    case 'model.deployed':
      db.model = { ...db.model, status: 'publicado', version: e.payload.version, dataset: e.payload.dataset, auc: e.payload.auc, loss: e.payload.loss, candidate: null, errorMessage: null, updatedAt: at }
      push(db.activity, { id: e.event_id, kind: 'modelo', at, text: `Modelo ${e.payload.version} publicado` }, 30)
      return
    case 'model.inference':
      if (e.payload.phase === 'started' && db.model.status === 'publicado') {
        db.model = { ...db.model, status: 'inferencia activa', updatedAt: at }
      } else if (e.payload.phase === 'finished' && db.model.status === 'inferencia activa') {
        db.model = { ...db.model, status: 'publicado', latencyMs: e.payload.latencyMs ?? db.model.latencyMs, updatedAt: at }
      }
      return
  }
}