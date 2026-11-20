import type { Db, Row, SkillRow } from '../types/models'
import { CATALOG } from './catalog'

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}
const R = rng(2026)
const zeros = () => Array<number>(12).fill(0)

// 2 instituciones × 6 cursos × 2 cohortes = 24 filas
const rows: Row[] = []
for (const inst of CATALOG.instituciones) {
  for (const curso of CATALOG.cursos) {
    for (const coh of CATALOG.cohortes) {
      const matriculas = Math.round(40 + R() * 80)
      const start = coh.id === 'c2026-1' ? 0 : 6
      const row: Row = {
        id: `${inst.id}|${curso.id}|${coh.id}`,
        institucionId: inst.id,
        programaId: curso.programaId,
        cursoId: curso.id,
        cohorteId: coh.id,
        matriculas,
        start,
        activos: zeros(), horas: zeros(), actividades: zeros(),
        evaluaciones: zeros(), completados: zeros(), certificados: zeros(),
      }
      for (let m = start; m < 12; m++) {
        const ramp = Math.min(1, (m - start + 1) / 4)
        const act = Math.min(matriculas, Math.round(matriculas * (0.35 + 0.5 * ramp) * (0.9 + 0.2 * R())))
        row.activos[m] = act
        row.horas[m] = Math.round(act * (8 + 6 * R()))
        row.actividades[m] = Math.round(act * (4 + 4 * R()))
        row.evaluaciones[m] = Math.round(act * (0.8 + 0.8 * R()))
        if (m >= start + 2) {
          const c = Math.round(matriculas * (0.02 + 0.04 * R()))
          row.completados[m] = c
          row.certificados[m] = Math.round(c * (0.8 + 0.2 * R()))
        }
      }
      rows.push(row)
    }
  }
}

const norm = (a: number[]) => {
  const t = a.reduce((x, y) => x + y, 0)
  const r = a.map((v) => Math.round((v / t) * 100))
  r[2] += 100 - r.reduce((x, y) => x + y, 0)
  return r
}
const SKILL_DEFS: [string, string, string][] = [
  ['sk-analisis', 'Análisis de datos', 'ds'],
  ['sk-modelado', 'Modelado predictivo', 'ds'],
  ['sk-frontend', 'Desarrollo frontend', 'dev'],
  ['sk-apis', 'Diseño de APIs', 'dev'],
  ['sk-contenedores', 'Contenedores', 'cloud'],
  ['sk-cicd', 'Automatización CI/CD', 'cloud'],
]
const skills: SkillRow[] = SKILL_DEFS.map(([id, name, programaId], i) => {
  const estimated = norm([0, 1, 2, 3, 4].map(() => 5 + R() * 30))
  return {
    id, name, programaId, estimated,
    validated: i % 2 === 0 ? norm(estimated.map((v) => Math.max(1, v + (R() * 10 - 5)))) : null,
  }
})

const now = Date.now()
const iso = (minAgo: number) => new Date(now - minAgo * 60000).toISOString()

export const db: Db = {
  rows,
  skills,
  recommendations: [
    { id: 'r1', text: 'Repasa: Modelado predictivo', competencia: 'Modelado predictivo', motivo: 'Brecha en evaluaciones recientes', dificultad: 'media', impacto: 'alto', modelVersion: '0.1-demo', createdAt: iso(10), status: 'nueva', useful: null },
    { id: 'r2', text: 'Completa: Machine Learning Básico', competencia: 'Análisis de datos', motivo: 'Curso en progreso con avance pendiente', dificultad: 'media', impacto: 'medio', modelVersion: '0.1-demo', createdAt: iso(25), status: 'nueva', useful: null },
    { id: 'r3', text: 'Sigue: Ruta de Ciencia de Datos', competencia: 'Análisis de datos', motivo: 'Siguiente paso de la ruta asignada', dificultad: 'baja', impacto: 'medio', modelVersion: '0.1-demo', createdAt: iso(40), status: 'nueva', useful: null },
    { id: 'r4', text: 'Realiza: Proyecto de API REST', competencia: 'Diseño de APIs', motivo: 'Actividad pendiente de la ruta', dificultad: 'alta', impacto: 'alto', modelVersion: '0.1-demo', createdAt: iso(90), status: 'nueva', useful: null },
  ],
  activity: [
    { id: 'a1', kind: 'progreso', text: 'E-2041 completó una lección de Python para Datos', at: iso(120), institucionId: 'inst-andina', cursoId: 'ds-python' },
    { id: 'a2', kind: 'certificado', text: 'Certificado emitido a E-1873 · Desarrollo Web', at: iso(180), institucionId: 'inst-costa', cursoId: 'dev-web' },
    { id: 'a3', kind: 'evaluacion', text: 'E-3310 aprobó evaluación de Docker', at: iso(300), institucionId: 'inst-andina', cursoId: 'cloud-docker' },
    { id: 'a4', kind: 'modelo', text: 'Modelo 0.1-demo publicado', at: iso(1440) },
  ],
  notifications: [
    { id: 'n1', text: 'Nueva evaluación publicada en APIs REST', at: iso(30), read: false },
    { id: 'n2', text: 'Meta semanal alcanzada', at: iso(200), read: false },
    { id: 'n3', text: 'Un docente comentó una entrega', at: iso(600), read: false },
  ],
  audit: [
    { id: 'u1', at: iso(5), actor: 'superadmin', action: 'Inicio de sesión (simulado)', resource: 'sesión' },
  ],
  model: {
    name: 'EduMaster Multi-Task Learning Network',
    version: '0.1-demo',
    dataset: 'DEMO v1',
    status: 'publicado',
    epoch: 12,
    totalEpochs: 12,
    loss: 0.312,
    auc: 0.842,
    latencyMs: 240,
    updatedAt: iso(1440),
    runId: null,
    correlationId: null,
    errorMessage: null,
    candidate: null,
    isDemo: true,
    inputs: ['Días activos', 'Sesiones', 'Avance', 'Nota media', 'Entregas tardías', 'Evidencia de habilidad'],
    heads: ['Finalización', 'Dominio', 'Riesgo', 'Recomendación'],
    layers: [
      { id: 'in', name: 'Entrada', group: 'entrada', neurons: 6, operation: 'Normalización', tensor: '[B, 6]' },
      { id: 'emb', name: 'Embeddings', group: 'proyeccion', neurons: 8, operation: 'Embedding + concat', tensor: '[B, 16]' },
      { id: 'h1', name: 'Densa 1', group: 'oculta', neurons: 8, operation: 'Linear + ReLU', tensor: '[B, 64]' },
      { id: 'gru', name: 'GRU', group: 'temporal', neurons: 6, operation: 'GRU · ventana 14 días', tensor: '[B, 14, 32]' },
      { id: 'fus', name: 'Fusión', group: 'oculta', neurons: 6, operation: 'Concat + LayerNorm + Dropout', tensor: '[B, 96]' },
      { id: 'out', name: 'Cabezas', group: 'salida', neurons: 4, operation: 'Sigmoid / Softmax / Ranking', tensor: '[B, 4]' },
    ],
  },
  lastEventAt: iso(0),
}

const listeners = new Set<() => void>()
export const onDbChange = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
export const touch = () => listeners.forEach((l) => l())