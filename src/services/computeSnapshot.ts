import type {
  CompletionStats, DashboardSnapshot, Db, Filters, Kpi, MonthlyKey, RoleId, Row,
} from '../types/models'
import { CATALOG, LEVELS, REGIONS, REGION_OFFSET, REGION_W } from './catalog'
import { DOCENTE_CURSOS, can } from './permissions'

const r1 = (n: number) => Math.round(n * 10) / 10
const pct = (cur: number, prev: number) => (prev > 0 ? r1(((cur - prev) / prev) * 100) : null)
const monthIdx = (id: string) => CATALOG.meses.findIndex((m) => m.id === id)

function inScope(r: Row, f: Filters, role: RoleId) {
  if (f.institucion !== 'todos' && r.institucionId !== f.institucion) return false
  if (f.programa !== 'todos' && r.programaId !== f.programa) return false
  if (f.curso !== 'todos' && r.cursoId !== f.curso) return false
  if (f.cohorte !== 'todos' && r.cohorteId !== f.cohorte) return false
  if (role === 'docente' && !DOCENTE_CURSOS.includes(r.cursoId)) return false
  return true
}

export function computeSnapshot(db: Db, f: Filters, role: RoleId): DashboardSnapshot {
  const a = Math.max(0, monthIdx(f.from))
  const b = Math.max(a, monthIdx(f.to))
  const len = b - a + 1
  const pa = a - len
  const pb = a - 1
  const prev = pa >= 0 // existe periodo comparable
  const rows = db.rows.filter((r) => inScope(r, f, role))

  const sum = (k: MonthlyKey, x: number, y: number) =>
    rows.reduce((t, r) => {
      let s = 0
      for (let i = x; i <= y; i++) s += r[k][i]
      return t + s
    }, 0)
  const at = (k: MonthlyKey, i: number) => rows.reduce((t, r) => t + r[k][i], 0)
  const courses = (x: number, y: number) =>
    new Set(rows.filter((r) => sum2(r, x, y) > 0).map((r) => r.cursoId)).size
  const sum2 = (r: Row, x: number, y: number) => {
    let s = 0
    for (let i = x; i <= y; i++) s += r.horas[i]
    return s
  }

  const completion = (i: number): CompletionStats => {
    let total = 0
    let comp = 0
    for (const r of rows) {
      if (r.start > i) continue
      total += r.matriculas
      let c = 0
      for (let m = 0; m <= i; m++) c += r.completados[m]
      comp += Math.min(c, r.matriculas)
    }
    const noIniciados = Math.round(total * 0.07)
    comp = Math.min(comp, total - noIniciados)
    return {
      completados: comp,
      enProgreso: Math.max(0, total - comp - noIniciados),
      noIniciados,
      total,
      pctCompletados: total ? r1((comp / total) * 100) : 0,
    }
  }

  const cur = completion(b)
  const old = prev ? completion(pb) : null
  const SRC = 'Simulación (DEMO)'
  const now = db.lastEventAt

  const kpis: Kpi[] = [
    { id: 'alumnos', label: 'Alumnos activos', value: at('activos', b), unit: '', variation: prev ? pct(at('activos', b), at('activos', pb)) : null, updatedAt: now, source: SRC, definition: 'Estudiantes con actividad en el último mes del periodo.' },
    { id: 'cursos', label: 'Cursos con actividad', value: courses(a, b), unit: '', variation: prev ? pct(courses(a, b), courses(pa, pb)) : null, updatedAt: now, source: SRC, definition: 'Cursos con horas de aprendizaje registradas en el periodo.' },
    { id: 'horas', label: 'Horas de aprendizaje', value: sum('horas', a, b), unit: 'h', variation: prev ? pct(sum('horas', a, b), sum('horas', pa, pb)) : null, updatedAt: now, source: SRC, definition: 'Suma de horas de actividad válida en el periodo.' },
    { id: 'certificaciones', label: 'Certificaciones', value: sum('certificados', a, b), unit: '', variation: prev ? pct(sum('certificados', a, b), sum('certificados', pa, pb)) : null, updatedAt: now, source: SRC, definition: 'Certificados emitidos en el periodo.' },
    { id: 'finalizacion', label: 'Tasa de finalización', value: cur.pctCompletados, unit: '%', variation: old ? pct(cur.pctCompletados, old.pctCompletados) : null, updatedAt: now, source: SRC, definition: 'Matrículas completadas / matrículas totales al cierre del periodo.' },
    { id: 'modelo', label: 'Calidad del modelo (AUC val.)', value: r1(db.model.auc * 100), unit: '%', variation: null, updatedAt: db.model.updatedAt, source: 'Entrenamiento simulado (DEMO)', definition: 'AUC de validación del modelo vigente. Dato simulado, no es una medición real.' },
  ]

  const trend = Array.from({ length: len }, (_, k) => {
    const m = a + k
    return { month: CATALOG.meses[m].id, label: CATALOG.meses[m].label, horas: sum('horas', m, m), actividades: sum('actividades', m, m), evaluaciones: sum('evaluaciones', m, m) }
  })

  const regions = REGIONS.map((reg, k) => {
    const share = (i: number) => Math.round(rows.reduce((t, r) => t + r.activos[i] * REGION_W[r.institucionId][k], 0))
    const v = share(b)
    return {
      id: reg.id, nombre: reg.nombre, lat: reg.lat, lng: reg.lng, alumnos: v,
      finalizacion: Math.min(100, Math.max(0, r1(cur.pctCompletados + REGION_OFFSET[k]))),
      variation: prev ? pct(v, share(pb)) : null,
    }
  })

  const progId =
    f.curso !== 'todos'
      ? CATALOG.cursos.find((c) => c.id === f.curso)?.programaId
      : f.programa !== 'todos' ? f.programa : null

  const activity = db.activity
    .filter(
      (x) =>
        (f.institucion === 'todos' || !x.institucionId || x.institucionId === f.institucion) &&
        (f.curso === 'todos' || !x.cursoId || x.cursoId === f.curso) &&
        !(role === 'docente' && x.cursoId && !DOCENTE_CURSOS.includes(x.cursoId)),
    )
    .slice(0, 10)

  return {
    kpis,
    trend,
    completion: cur,
    regions,
    skills: {
      levels: LEVELS,
      skills: db.skills.filter((s) => !progId || s.programaId === progId),
      note: 'Estimado por IA (DEMO) vs. validado por docente. No depende del periodo.',
    },
    recommendations: db.recommendations.map((r) => ({ ...r })),
    activity,
    notifications: db.notifications.map((n) => ({ ...n })),
    unreadNotifications: db.notifications.filter((n) => !n.read).length,
    audit: can(role, 'audit.read') ? [...db.audit] : [],
    model: { ...db.model },
    updatedAt: db.lastEventAt,
  }
}