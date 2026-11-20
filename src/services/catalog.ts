import type { Catalog } from '../types/models'

const MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// 12 meses: dic-2025 … nov-2026
const meses = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2025, 11 + i, 1)
  return { id: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: MES[d.getMonth()] }
})

export const CATALOG: Catalog = {
  instituciones: [
    { id: 'inst-andina', nombre: 'Instituto Andino (DEMO)' },
    { id: 'inst-costa', nombre: 'Instituto Costa (DEMO)' },
  ],
  programas: [
    { id: 'ds', nombre: 'Ciencia de Datos' },
    { id: 'dev', nombre: 'Desarrollo de Software' },
    { id: 'cloud', nombre: 'Cloud y DevOps' },
  ],
  cursos: [
    { id: 'ds-python', nombre: 'Python para Datos', programaId: 'ds' },
    { id: 'ds-ml', nombre: 'Machine Learning Básico', programaId: 'ds' },
    { id: 'dev-web', nombre: 'Desarrollo Web', programaId: 'dev' },
    { id: 'dev-api', nombre: 'APIs REST', programaId: 'dev' },
    { id: 'cloud-docker', nombre: 'Contenedores con Docker', programaId: 'cloud' },
    { id: 'cloud-ci', nombre: 'CI/CD', programaId: 'cloud' },
  ],
  cohortes: [
    { id: 'c2026-1', nombre: '2026-I' },
    { id: 'c2026-2', nombre: '2026-II' },
  ],
  meses,
}

export const LEVELS = ['Principiante', 'Elemental', 'Intermedio', 'Avanzado', 'Experto']

// Regiones agregadas (nunca datos individuales)
export const REGIONS = [
  { id: 'lima', nombre: 'Lima', lat: -12.05, lng: -77.04 },
  { id: 'arequipa', nombre: 'Arequipa', lat: -16.4, lng: -71.54 },
  { id: 'cusco', nombre: 'Cusco', lat: -13.53, lng: -71.97 },
  { id: 'la-libertad', nombre: 'La Libertad', lat: -8.11, lng: -79.03 },
  { id: 'piura', nombre: 'Piura', lat: -5.19, lng: -80.63 },
  { id: 'junin', nombre: 'Junín', lat: -12.07, lng: -75.21 },
]
export const REGION_W: Record<string, number[]> = {
  'inst-andina': [0.3, 0.22, 0.2, 0.08, 0.05, 0.15],
  'inst-costa': [0.42, 0.06, 0.04, 0.22, 0.2, 0.06],
}
export const REGION_OFFSET = [0, -3, 2, -1, -2, 1]