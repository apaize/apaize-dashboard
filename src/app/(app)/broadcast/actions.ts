'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type BroadcastSegment = 'all' | 'anges' | 'premium' | 'group';

export async function broadcastNotification(args: {
  segment: BroadcastSegment;
  groupId?: string | null;
  type: 'system' | 'warning';
  title: string;
  message: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Build list of user IDs based on segment
  let userIds: string[] = [];
  if (args.segment === 'all') {
    const { data } = await supabase.from('profiles').select('id').is('banned_until', null);
    userIds = (data ?? []).map((p: any) => p.id);
  } else if (args.segment === 'anges') {
    const { data } = await supabase.from('angel_profiles').select('user_id').eq('is_angel', true);
    userIds = (data ?? []).map((p: any) => p.user_id);
  } else if (args.segment === 'group' && args.groupId) {
    const { data } = await supabase.from('group_members').select('user_id').eq('group_id', args.groupId);
    userIds = (data ?? []).map((p: any) => p.user_id);
  }
  // Note: 'premium' segment requires RevenueCat integration — placeholder for now
  if (args.segment === 'premium') {
    return { sent: 0, error: 'Segment premium pas encore implémenté (RevenueCat integration TBD)' };
  }

  if (userIds.length === 0) return { sent: 0, error: 'Aucun destinataire' };

  const rows = userIds.map((uid) => ({
    user_id: uid,
    type: args.type,
    title: args.title,
    message: args.message,
  }));

  const { error } = await supabase.from('user_notifications').insert(rows);
  if (error) return { sent: 0, error: error.message };

  revalidatePath('/broadcast');
  return { sent: userIds.length, error: null };
}
