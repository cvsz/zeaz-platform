import { AdminAuditLogService } from '@/services/AdminAuditLogService';

export async function logAdminAction(
  userId: string,
  action: string,
  resource: string,
  details: Record<string, any>
) {
  try {
    await AdminAuditLogService.writeBestEffort({
      actorUserId: userId,
      action: action,
      targetType: resource,
      metadata: details,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't block action on log failure, but alert
  }
}
