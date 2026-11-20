export type EventType =
  | 'learning.progress.updated'
  | 'assessment.submitted'
  | 'course.completed'
  | 'recommendation.created'
  | 'notification.created'
  | 'model.training.progress'

export interface DomainEvent<T = unknown> {
  event_id: string
  event_type: EventType
  occurred_at: string      // ISO UTC
  schema_version: number
  source: 'simulacion'
  payload: T
}