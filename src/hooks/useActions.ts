import { useSessionStore } from '../stores/sessionStore'
import {
  approveCandidate, markNotificationsRead, recommendationFeedback, requestTraining,
  type RecAction,
} from '../services/dashboardService'
import { can, type Perm } from '../services/permissions'

export function useActions() {
  const role = useSessionStore((s) => s.role)
  return {
    role,
    can: (p: Perm) => can(role, p),
    feedback: (id: string, a: RecAction) => recommendationFeedback(role, id, a),
    requestTraining: () => requestTraining(role),
    approveCandidate: () => approveCandidate(role),
    markNotificationsRead,
  }
}