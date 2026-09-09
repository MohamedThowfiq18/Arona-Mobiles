import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

export interface AuditEventParams {
  ownerId?: string;
  action:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'LOGOUT'
    | 'OTP_REQUESTED'
    | 'OTP_SENT'
    | 'OTP_VERIFIED'
    | 'OTP_FAILED'
    | 'OTP_RATE_LIMITED'
    | 'PASSWORD_RESET_REQUESTED'
    | 'PASSWORD_RESET_COMPLETED'
    | 'PASSWORD_CHANGED'
    | 'PRODUCT_CREATED'
    | 'PRODUCT_UPDATED'
    | 'PRODUCT_DELETED'
    | 'PRICE_UPDATED'
    | 'COUPON_CREATED'
    | 'COUPON_UPDATED'
    | 'UNAUTHORIZED_ACCESS_ATTEMPT';
  targetTable?: string;
  targetId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  note?: string;
}

/**
 * Record a secure audit log entry for owner and administrative actions.
 * Never stores plain text passwords, OTPs, or credit card info.
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  const timestamp = new Date().toISOString();

  // Sanitize newData/oldData to guarantee no sensitive credentials leak into logs
  const sanitizedNewData = sanitizeLogData(params.newData);
  const sanitizedOldData = sanitizeLogData(params.oldData);

  // Server-side structured audit logging
  const logPrefix = `[AUDIT ${timestamp}] [${params.action}]`;
  const targetInfo = params.targetTable ? ` Table: ${params.targetTable} (ID: ${params.targetId || 'N/A'})` : '';
  const actorInfo = ` Actor: ${params.ownerId || 'Anonymous'} | IP: ${params.ipAddress || 'unknown'}`;
  
  if (params.action.includes('FAILED') || params.action.includes('UNAUTHORIZED')) {
    console.warn(`⚠️ ${logPrefix}${targetInfo}${actorInfo} - ${params.note || 'Security alert'}`);
  } else {
    console.info(`🛡️ ${logPrefix}${targetInfo}${actorInfo}`);
  }

  // Persist to Supabase audit_log table if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      await supabase.from('audit_log').insert({
        owner_id: params.ownerId && !params.ownerId.startsWith('anon') && !params.ownerId.startsWith('owner-')
          ? params.ownerId
          : null,
        action: params.action,
        target_table: params.targetTable || 'system',
        target_id: params.targetId || null,
        old_data: sanitizedOldData,
        new_data: {
          ...sanitizedNewData,
          ip_address: params.ipAddress,
          user_agent: params.userAgent,
          note: params.note,
          raw_owner_id: params.ownerId,
        },
        ip_address: params.ipAddress || null,
      });
    } catch (err) {
      // In-memory / server console logging already succeeded
      console.warn('Supabase audit_log insert failed (continuing safely):', err);
    }
  }
}

function sanitizeLogData(data?: Record<string, any>): Record<string, any> | undefined {
  if (!data) return undefined;
  const sanitized: Record<string, any> = {};
  const sensitiveKeys = ['password', 'password_hash', 'otp', 'code', 'token', 'secret', 'key'];

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
