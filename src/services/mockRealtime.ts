import type { DomainEvent, EventPayloadMap, EventType } from '../types/events'
import { db, touch } from './mockDb'
import { applyEvent } from './applyEvent'
import { realtimeClient } from './realtimeClient'

export type GeneralType =
  | 'learning.progress.updated' | 'assessment.submitted' | 'course.completed'
  | 'recommendation.created' | 'notification.created' | 'model.inference'

const uid = () => crypto.randomUUID()
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

const REC_POOL = [
  { text: 'Practica: SQL Intermedio', competencia: 'Análisis de datos', motivo: 'Brecha en evidencias de consultas', dificultad: 'media' as const, impacto: 'alto' as const },
  { text: 'Repasa: Redes Neuronales', competencia: 'Modelado predictivo', motivo: 'Evaluación reciente por debajo del promedio', dificultad: 'alta' as const, impacto: 'alto' as const },
  { text: 'Explora: Docker desde cero', competencia: 'Contenedores', motivo: 'Afín a la ruta Cloud y DevOps', dificultad: 'baja' as const, impacto: 'medio' as const },
  { text: 'Completa: Proyecto de frontend', competencia: 'Desarrollo frontend', motivo: 'Actividad pendiente de la ruta', dificultad: 'media' as const, impacto: 'medio' as const },
  { text: 'Refuerza: Pruebas de APIs', competencia: 'Diseño de APIs', motivo: 'Entregas tardías recientes', dificultad: 'media' as const, impacto: 'bajo' as const },
]
const NOTIFS = ['Nueva evaluación publicada', 'Un docente comentó una entrega', 'Meta semanal alcanzada', 'Nuevo material disponible']

function make<K extends EventType>(
  type: K, payload: EventPayloadMap[K],
  org = 'plataforma', aggregate = 'sistema', correlation: string = uid(),
): DomainEvent {
  return {
    event_id: uid(), event_type: type, occurred_at: new Date().toISOString(),
    organization_id: org, aggregate_id: aggregate, correlation_id: correlation,
    schema_version: 1, source: 'simulacion', payload,
  } as DomainEvent
}

function publish(e: DomainEvent) {
  applyEvent(db, e) // 1) la "base" cambia
  touch() // 2) las consultas en caché se recalculan
  realtimeClient.publish(e) // 3) se notifica a los listeners
}

function ctx() {
  const r = pick(db.rows)
  return { rowId: r.id, institucionId: r.institucionId, cursoId: r.cursoId, cohorteId: r.cohorteId, estudiante: `E-${rand(1000, 9999)}` }
}

function emitGeneral(type: GeneralType) {
  switch (type) {
    case 'learning.progress.updated': {
      const c = ctx()
      publish(make(type, { ...c, activosDelta: rand(1, 3), horasDelta: rand(4, 15), actividadesDelta: rand(5, 20) }, c.institucionId, c.rowId))
      return
    }
    case 'assessment.submitted': {
      const c = ctx()
      publish(make(type, { ...c, aprobado: Math.random() > 0.25 }, c.institucionId, c.rowId))
      return
    }
    case 'course.completed': {
      const c = ctx()
      publish(make(type, c, c.institucionId, c.rowId))
      return
    }
    case 'recommendation.created': {
      const free = REC_POOL.filter((p) => !db.recommendations.some((r) => r.status === 'nueva' && r.text === p.text))
      if (!free.length) return
      publish(make(type, { id: uid(), ...pick(free) }))
      return
    }
    case 'notification.created':
      publish(make(type, { id: uid(), text: pick(NOTIFS) }))
      return
    case 'model.inference': {
      if (db.model.status !== 'publicado') return
      publish(make(type, { phase: 'started' }))
      setTimeout(() => publish(make(type, { phase: 'finished', latencyMs: rand(180, 620) })), 1400)
      return
    }
  }
}

const WEIGHTED: GeneralType[] = [
  'learning.progress.updated', 'learning.progress.updated', 'learning.progress.updated', 'learning.progress.updated',
  'assessment.submitted', 'assessment.submitted', 'assessment.submitted',
  'course.completed',
  'recommendation.created',
  'notification.created', 'notification.created',
  'model.inference', 'model.inference',
]

// ---------- Entrenamiento simulado ----------
const TOTAL_EPOCHS = 12
const BUSY = ['cargando datos', 'entrenando', 'validando']
interface Run { runId: string; correlationId: string; step: number; epoch: number; loss: number; auc: number }
let run: Run | null = null
let trainTimer: ReturnType<typeof setInterval> | null = null

function stopTrainTimer() {
  if (trainTimer) clearInterval(trainTimer)
  trainTimer = null
}
function ensureTrainTimer() {
  if (run && !trainTimer) trainTimer = setInterval(trainTick, 1200)
}

function trainTick() {
  if (!run) return
  run.step++
  const { runId, correlationId } = run
  const prog = (status: 'cargando datos' | 'entrenando' | 'validando') =>
    publish(make('model.training.progress', { runId, status, epoch: run!.epoch, loss: run!.loss, auc: run!.auc }, 'plataforma', runId, correlationId))

  if (run.step <= 2) {
    prog('cargando datos')
  } else if (run.step <= 2 + TOTAL_EPOCHS) {
    run.epoch = run.step - 2
    run.loss = +Math.max(0.05, run.loss * 0.9).toFixed(3)
    run.auc = +Math.min(0.97, run.auc + (0.97 - run.auc) * 0.18).toFixed(3)
    prog('entrenando')
  } else if (run.step <= 4 + TOTAL_EPOCHS) {
    prog('validando')
  } else {
    const minor = (parseInt(db.model.version.split('.')[1], 10) || 1) + 1
    publish(make('model.training.completed', { runId, auc: run.auc, loss: run.loss, candidateVersion: `0.${minor}-demo` }, 'plataforma', runId, correlationId))
    stopTrainTimer()
    run = null
  }
}

function startTraining(): boolean {
  if (BUSY.includes(db.model.status)) return false
  const runId = `run-${uid().slice(0, 8)}`
  run = { runId, correlationId: uid(), step: 0, epoch: 0, loss: 0.9, auc: 0.5 }
  publish(make('model.training.started', { runId, totalEpochs: TOTAL_EPOCHS, correlationId: run.correlationId }, 'plataforma', runId, run.correlationId))
  ensureTrainTimer()
  return true
}

function failTraining() {
  if (!run) return
  const { runId, correlationId } = run
  stopTrainTimer()
  run = null
  publish(make('model.training.failed', { runId, correlationId, message: 'Fallo simulado en el worker de entrenamiento' }, 'plataforma', runId, correlationId))
}

function deploy(): boolean {
  const c = db.model.candidate
  if (!c) return false
  publish(make('model.deployed', { version: c.version, dataset: db.model.dataset, auc: c.auc, loss: c.loss }))
  return true
}

// ---------- Emisor general ----------
let timer: ReturnType<typeof setTimeout> | null = null
let running = false

function schedule() {
  timer = setTimeout(() => {
    if (!running) return
    emitGeneral(pick(WEIGHTED))
    schedule()
  }, rand(2000, 4500))
}
function halt() {
  running = false
  if (timer) clearTimeout(timer)
  timer = null
  stopTrainTimer()
}

export const simulation = {
  start() {
    if (running) return
    running = true
    realtimeClient.setStatus('en-vivo')
    schedule()
    ensureTrainTimer()
  },
  pause() {
    halt()
    realtimeClient.setStatus('pausado')
  },
  stop() {
    halt()
    realtimeClient.setStatus('sin-conexion')
  },
  trigger: (type: GeneralType) => emitGeneral(type),
  startTraining,
  failTraining,
  deploy,
  isRunning: () => running,
}

// Demo: en la consola del navegador → simulation.trigger('course.completed') / simulation.failTraining()
if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).simulation = simulation