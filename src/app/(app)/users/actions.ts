'use server';

// ============================================================
// 🛡️ Server Actions — modération users
// Toutes les actions sont loggées dans moderation_actions
// ============================================================
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function logAction(args: {
  targetUserId: string;
  actionType: 'warn' | 'mute' | 'ban' | 'unmute' | 'unban' | 'delete_message';
  durationHours?: number | null;
  reason?: string;
  reportId?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const expiresAt = args.durationHours
    ? new Date(Date.now() + args.durationHours * 3600_000).toISOString()
    : null;

  await supabase.from('moderation_actions').insert({
    admin_id: user.id,
    target_user_id: args.targetUserId,
    action_type: args.actionType,
    duration_hours: args.durationHours ?? null,
    expires_at: expiresAt,
    reason: args.reason ?? null,
    report_id: args.reportId ?? null,
  });
}

export async function warnUser(targetUserId: string, reason: string) {
  const supabase = await createClient();
  await supabase
    .from('profiles')
    .update({
      warnings_count: ((await supabase.from('profiles').select('warnings_count').eq('id', targetUserId).maybeSingle()).data?.warnings_count ?? 0) + 1,
    })
    .eq('id', targetUserId);

  await logAction({ targetUserId, actionType: 'warn', reason });

  // Notification interne au user
  await supabase.from('user_notifications').insert({
    user_id: targetUserId,
    type: 'warning',
    title: 'Avertissement',
    message: reason,
  });

  revalidatePath('/users');
}

export async function muteUser(targetUserId: string, hours: number, reason: string) {
  const supabase = await createClient();
  const until = new Date(Date.now() + hours * 3600_000).toISOString();
  await supabase
    .from('profiles')
    .update({ muted_until: until })
    .eq('id', targetUserId);

  await logAction({ targetUserId, actionType: 'mute', durationHours: hours, reason });
  await supabase.from('user_notifications').insert({
    user_id: targetUserId,
    type: 'mute',
    title: `Compte muet pour ${hours}h`,
    message: reason,
    expires_at: until,
  });

  revalidatePath('/users');
}

export async function banUser(targetUserId: string, hours: number | null, reason: string) {
  const supabase = await createClient();
  const until = hours ? new Date(Date.now() + hours * 3600_000).toISOString() : null;
  await supabase
    .from('profiles')
    .update({ banned_until: until ?? '2099-12-31T23:59:59Z', ban_reason: reason })
    .eq('id', targetUserId);

  await logAction({ targetUserId, actionType: 'ban', durationHours: hours, reason });
  await supabase.from('user_notifications').insert({
    user_id: targetUserId,
    type: 'ban',
    title: hours ? `Compte banni pour ${hours}h` : 'Compte banni définitivement',
    message: reason,
    expires_at: until,
  });

  revalidatePath('/users');
}

export async function unbanUser(targetUserId: string) {
  const supabase = await createClient();
  await supabase
    .from('profiles')
    .update({ banned_until: null, ban_reason: null })
    .eq('id', targetUserId);

  await logAction({ targetUserId, actionType: 'unban' });
  revalidatePath('/users');
}

export async function unmuteUser(targetUserId: string) {
  const supabase = await createClient();
  await supabase.from('profiles').update({ muted_until: null }).eq('id', targetUserId);
  await logAction({ targetUserId, actionType: 'unmute' });
  revalidatePath('/users');
}
