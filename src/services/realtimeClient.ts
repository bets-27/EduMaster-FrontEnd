import type { DomainEvent } from '../types/events'

export type ConnectionStatus = 'en-vivo' | 'pausado' | 'sin-conexion'
export interface Connection {
  status: ConnectionStatus
  lastEventAt: string | null
}

type Listener = (e: DomainEvent) => void

const listeners = new Set<Listener>()
const connListeners = new Set<() => void>()
let connection: Connection = { status: 'sin-conexion', lastEventAt: null }

function setConnection(next: Connection) {
  connection = next
  connListeners.forEach((l) => l())
}

export const realtimeClient = {
  subscribe(l: Listener) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
  publish(e: DomainEvent) {
    listeners.forEach((l) => l(e))
    setConnection({ ...connection, lastEventAt: e.occurred_at })
  },
  setStatus(status: ConnectionStatus) {
    setConnection({ ...connection, status })
  },
  getConnection: () => connection,
  onConnection(l: () => void) {
    connListeners.add(l)
    return () => {
      connListeners.delete(l)
    }
  },
}