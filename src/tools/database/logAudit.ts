import insertToDatabase from './insertToDatabase';


export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'PROFILE_UPDATE' 
  | 'DOCUMENT_UPLOAD' 
  | 'APPROVAL_ACTION' 
  | 'SETTINGS_CHANGE';

export const logAudit = async (action: AuditAction, details: string, userId: string = 'SYSTEM') => {
  try {
    if (!userId) {
      console.warn('Could not log audit: User not authenticated');
      return;
    }

    await insertToDatabase({
      table: 'audit_logs',
      data: {
        user_id: userId,
        action,
        details,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};
