export interface Kpi {
  id: string
  label: string
  value: number
  variation: number        // % frente al periodo anterior
  updatedAt: string
  source: string           // "Simulación (DEMO)"
}

export interface ActivityItem { id: string; text: string; at: string; kind: string }
export interface Recommendation { id: string; text: string; reason: string; status: 'nueva'|'aceptada'|'descartada' }