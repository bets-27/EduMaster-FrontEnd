import type { ModelStatus } from './models'

interface Ctx {
  rowId: string
  institucionId: string
  cursoId: string
  cohorteId: string
  estudiante: string // seudónimo, ej. E-1042
}

export interface EventPayloadMap {
  'learning.progress.updated': Ctx & { activosDelta: number; horasDelta: number; actividadesDelta: number }
  'assessment.submitted': Ctx & { aprobado: boolean }
  'course.completed': Ctx
  'recommendation.created': {
    id: string; text: string; competencia: string; motivo: string
    dificultad: 'baja' | 'media' | 'alta'; impacto: 'bajo' | 'medio' | 'alto'
  }
  'notification.created': { id: string; text: string }
  'model.training.started': { runId: string; totalEpochs: number; correlationId: string }
  'model.training.progress': {
    runId: string
    status: Extract<ModelStatus, 'cargando datos' | 'entrenando' | 'validando'>
    epoch: number; loss: number; auc: number
  }
  'model.training.completed': { runId: string; auc: number; loss: number; candidateVersion: string }
  'model.training.failed': { runId: string; correlationId: string; message: string }
  'model.deployed': { version: string; dataset: string; auc: number; loss: number }
  'model.inference': { phase: 'started' | 'finished'; latencyMs?: number }
}

export type EventType = keyof EventPayloadMap

// Contrato de evento de la sección 10.4 del documento
export type DomainEvent = {
  [K in EventType]: {
    event_id: string
    event_type: K
    occurred_at: string // ISO UTC
    organization_id: string
    aggregate_id: string
    correlation_id: string
    schema_version: 1
    source: 'simulacion'
    payload: EventPayloadMap[K]
  }
}[EventType]