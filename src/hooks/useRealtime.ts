import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Filters, RoleId } from '../types/models'
import type { DomainEvent, EventType } from '../types/events'
import { DASHBOARD_KEY, snapshotNow } from '../services/dashboardService'
import { onDbChange } from '../services/mockDb'
import { realtimeClient } from '../services/realtimeClient'
import { simulation } from '../services/mockRealtime'

// Se llama UNA sola vez (en App). Cada cambio en la "base" recalcula las consultas en caché.
export function useRealtime() {
  const qc = useQueryClient()
  useEffect(() => {
    const refresh = () => {
      qc.getQueryCache().findAll({ queryKey: DASHBOARD_KEY }).forEach((q) => {
        const [, filters, role] = q.queryKey as unknown as [string, Filters, RoleId]
        qc.setQueryData(q.queryKey, snapshotNow(filters, role))
      })
    }
    const off = onDbChange(refresh)
    simulation.start()
    return () => {
      off()
      simulation.stop()
    }
  }, [qc])
}

// { status: 'en-vivo' | 'pausado' | 'sin-conexion', lastEventAt }
export function useConnection() {
  return useSyncExternalStore(realtimeClient.onConnection, realtimeClient.getConnection)
}

// Para reacciones puntuales (pulso de la red neuronal, toasts…)
export function useEventListener(types: EventType[], cb: (e: DomainEvent) => void) {
  const ref = useRef(cb)
  ref.current = cb
  const key = types.join('|')
  useEffect(
    () => realtimeClient.subscribe((e) => { if (types.includes(e.event_type)) ref.current(e) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )
}