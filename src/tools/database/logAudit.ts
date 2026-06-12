import insertToDatabase from './insertToDatabase';
import supabase from '@/client/supabase';


export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'PROFILE_UPDATE' 
  | 'DOCUMENT_UPLOAD' 
  | 'APPROVAL_ACTION' 
  | 'SETTINGS_CHANGE';

export const logAudit = async (action: AuditAction, details: string, userId?: string) => {
  try {
    const resolvedUserId = userId ?? (await supabase.auth.getUser()).data.user?.id;

    if (!resolvedUserId) {
      console.warn('Could not log audit: User not authenticated');
      return;
    }

    await insertToDatabase({
      table: 'audit_logs',
      data: {
        user_id: resolvedUserId,
        action,
        details,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};
