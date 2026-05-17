'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function getAdminId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return { supabase, adminId: user.id };
}

export async function suspendAngel(userId: string, hours: number, reason: string) {
  const { supabase, adminId } = await getAdminId();
  const until = hours > 0 ? new Date(Date.now() + hours * 3600_000).toISOString() : null;
  await supabase
    .from('angel_profiles')
    .update({
      is_suspended: true,
      suspended_until: until,
      is_available: false,
    })
    .eq('user_id', userId);

  await supabase.from('moderation_actions').insert({
    admin_id: adminId,
    target_user_id: userId,
    action_type: 'mute',
    duration_hours: hours,
    expires_at: until,
    reason: `Ange suspendu : ${reason}`,
  });
  await supabase.from('user_notifications').insert({
    user_id: userId,
    type: 'warning',
    title: 'Ton statut Ange est suspendu',
    message: reason,
    expires_at: until,
  });
  revalidatePath('/anges');
}

export async function unsuspendAngel(userId: string) {
  const { supabase, adminId } = await getAdminId();
  await supabase
    .from('angel_profiles')
    .update({ is_suspended: false, suspended_until: null })
    .eq('user_id', userId);
  await supabase.from('moderation_actions').insert({
    admin_id: adminId,
    target_user_id: userId,
    action_type: 'unmute',
    reason: 'Réactivation Ange',
  });
  revalidatePath('/anges');
}

export async function setAngelLevel(
  userId: string,
  level: 'bronze' | 'silver' | 'gold' | 'diamond'
) {
  const { supabase } = await getAdminId();
  await supabase.from('angel_profiles').update({ level }).eq('user_id', userId);
  revalidatePath('/anges');
}

export async function forceQuizPassed(userId: string) {
  const { supabase } = await getAdminId();
  await supabase
    .from('angel_profiles')
    .update({ quiz_passed: true, quiz_score: 100, training_completed_at: new Date().toISOString() })
    .eq('user_id', userId);
  await supabase
    .from('angel_training_progress')
    .upsert({ user_id: userId, quiz_passed: true, quiz_best_score: 100, quiz_passed_at: new Date().toISOString() }, { onConflict: 'user_id' });
  revalidatePath('/anges');
}
