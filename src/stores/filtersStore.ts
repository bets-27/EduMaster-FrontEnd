import { create } from 'zustand'
import type { Filters } from '../types/models'

export const DEFAULT_FILTERS: Filters = {
  institucion: 'todos',
  programa: 'todos',
  curso: 'todos',
  cohorte: 'todos',
  from: '2026-06',
  to: '2026-11',
}

interface FiltersState {
  filters: Filters
  setFilter: (k: keyof Filters, v: string) => void
  reset: () => void
}

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: DEFAULT_FILTERS,
  setFilter: (k, v) =>
    set((s) => {
      const f: Filters = { ...s.filters, [k]: v }
      if (k === 'programa') f.curso = 'todos'
      if (k === 'from' && f.from > f.to) f.to = f.from
      if (k === 'to' && f.to < f.from) f.from = f.to
      return { filters: f }
    }),
  reset: () => set({ filters: DEFAULT_FILTERS }),
}))