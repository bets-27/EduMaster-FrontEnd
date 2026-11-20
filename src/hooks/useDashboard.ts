import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { DashboardSnapshot } from '../types/models'
import { DASHBOARD_KEY, getDashboardSnapshot } from '../services/dashboardService'
import { useFiltersStore } from '../stores/filtersStore'
import { useSessionStore } from '../stores/sessionStore'

// useDashboard() → todo el snapshot. useDashboard((s) => s.trend) → solo esa porción.
// Los filtros y el rol se leen solos desde los stores.
export function useDashboard<T = DashboardSnapshot>(select?: (s: DashboardSnapshot) => T) {
  const filters = useFiltersStore((s) => s.filters)
  const role = useSessionStore((s) => s.role)
  return useQuery({
    queryKey: [...DASHBOARD_KEY, filters, role],
    queryFn: () => getDashboardSnapshot(filters, role),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    select,
  })
}