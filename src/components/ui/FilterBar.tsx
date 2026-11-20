import { RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { CATALOG } from '../../services/catalog'
import { useFiltersStore } from '../../stores/filtersStore'
import type { CatalogItem } from '../../types/models'

const sel = 'rounded-xl border border-brand/30 bg-panel px-2 py-1.5 text-sm text-title outline-none focus:border-neon'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      {children}
    </label>
  )
}
const options = (items: CatalogItem[]) => [
  <option key="todos" value="todos">Todos</option>,
  ...items.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>),
]

export default function FilterBar() {
  const { filters: f, setFilter, reset } = useFiltersStore()
  const cursos = CATALOG.cursos.filter((c) => f.programa === 'todos' || c.programaId === f.programa)
  const meses = CATALOG.meses.map((m) => <option key={m.id} value={m.id}>{`${m.label} ${m.id.slice(0, 4)}`}</option>)

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-brand/30 bg-panel p-3">
      <Field label="Institución"><select className={sel} value={f.institucion} onChange={(e) => setFilter('institucion', e.target.value)}>{options(CATALOG.instituciones)}</select></Field>
      <Field label="Programa"><select className={sel} value={f.programa} onChange={(e) => setFilter('programa', e.target.value)}>{options(CATALOG.programas)}</select></Field>
      <Field label="Curso"><select className={sel} value={f.curso} onChange={(e) => setFilter('curso', e.target.value)}>{options(cursos)}</select></Field>
      <Field label="Cohorte"><select className={sel} value={f.cohorte} onChange={(e) => setFilter('cohorte', e.target.value)}>{options(CATALOG.cohortes)}</select></Field>
      <Field label="Desde"><select className={sel} value={f.from} onChange={(e) => setFilter('from', e.target.value)}>{meses}</select></Field>
      <Field label="Hasta"><select className={sel} value={f.to} onChange={(e) => setFilter('to', e.target.value)}>{meses}</select></Field>
      <button onClick={reset} className="flex items-center gap-1 rounded-xl border border-brand/30 px-3 py-1.5 text-sm text-neon hover:bg-panel2">
        <RotateCcw size={14} /> Restablecer
      </button>
    </div>
  )
}