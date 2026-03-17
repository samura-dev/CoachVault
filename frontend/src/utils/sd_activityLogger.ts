import { sd_pb } from '../lib/sd_pocketbase';

export type Sd_ActivityActionType = 'create' | 'update' | 'delete' | 'status_change' | 'system';
export type Sd_ActivityEntityType = 'athlete' | 'workout' | 'note' | 'measurement' | 'program' | 'system' | 'auth';

export interface Sd_LogActivityPayload {
  action_type: Sd_ActivityActionType;
  entity_type: Sd_ActivityEntityType;
  title: string;
  entity_id?: string;
  details?: unknown;
}

/**
 * Utility function to transparently log a user's activity in the PocketBase backend.
 * Fire-and-forget, fails silently to not disrupt the main user flow.
 * 
 * @param payload Activity details
 */
export const sd_logActivity = async (payload: Sd_LogActivityPayload) => {
  try {
    const userId = sd_pb.authStore.model?.id;
    if (!userId) {
      console.warn('sd_logActivity: Ignored because no user is logged in.');
      return;
    }

    await sd_pb.collection('sd_activity_logs').create({
      user: userId,
      ...payload
    });
  } catch (error) {
    // We intentionally catch and hide errors here to avoid disrupting the main action
    // (e.g., if creating an athlete succeeded but logging failed, the user shouldn't see an error popup).
    console.error('[sd_activityLogger] Failed to log activity:', error);
  }
};
