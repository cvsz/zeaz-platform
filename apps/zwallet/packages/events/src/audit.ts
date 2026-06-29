export interface AuditEvent {
  action: string;
  actor: string;
  target?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

const auditEvents: AuditEvent[] = [];

export function logAuditEvent(event: AuditEvent): void {
  auditEvents.push(event);
}

export function readAuditEvents(): readonly AuditEvent[] {
  return auditEvents;
}

export function clearAuditEvents(): void {
  auditEvents.length = 0;
}
