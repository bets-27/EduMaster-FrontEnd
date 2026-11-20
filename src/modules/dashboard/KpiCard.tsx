import Card from '../../components/ui/Card'
import type { Kpi } from '../../types/models'

const nf = (n: number) => n.toLocaleString('es-PE')
const fmt = (k: Kpi) => (k.unit === '%' ? `${nf(k.value)}%` : k.unit === 'h' ? `${nf(k.value)} h` : nf(k.value))

export default function KpiCard({ kpi }: { kpi: Kpi }) {
  const v = kpi.variation
  return (
    <Card className="p-3" >
      <p className="text-xs text-muted" title={kpi.definition}>{kpi.label}</p>
      <p className="text-2xl font-bold">{fmt(kpi)}</p>
      <p className={v === null ? 'text-xs text-muted' : v >= 0 ? 'text-xs text-ok' : 'text-xs text-danger'}>
        {v === null ? '— sin periodo previo' : `${v >= 0 ? '↑' : '↓'} ${Math.abs(v)}% vs periodo anterior`}
      </p>
      <p className="mt-1 text-[10px] text-muted">
        Act. {new Date(kpi.updatedAt).toLocaleTimeString('es-PE')} · {kpi.source}
      </p>
    </Card>
  )
}