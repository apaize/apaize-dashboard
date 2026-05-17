'use server';

// ============================================================
// 🛡️ Server actions — modération salons/messages
// ============================================================
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

// ─── Messages ───
export async function hideMessage(messageId: string, reason: string) {
  const { supabase, adminId } = await getAdminId();
  await supabase
    .from('messages')
    .update({
      hidden: true,
      hidden_reason: reason,
      hidden_at: new Date().toISOString(),
    })
    .eq('id', messageId);

  // Log moderation action si on connait le target_user_id du message
  const { data: msg } = await supabase
    .from('messages')
    .select('user_id')
    .eq('id', messageId)
    .maybeSingle();
  if (msg) {
    await supabase.from('moderation_actions').insert({
      admin_id: adminId,
      target_user_id: msg.user_id,
      action_type: 'delete_message',
      reason,
    });
  }
  revalidatePath('/groups');
}

export async function unhideMessage(messageId: string) {
  const { supabase } = await getAdminId();
  await supabase
    .from('messages')
    .update({ hidden: false, hidden_reason: null, hidden_at: null })
    .eq('id', messageId);
  revalidatePath('/groups');
}

// ─── Groups ───
export async function setGroupOpen(groupId: string, isOpen: boolean) {
  const { supabase } = await getAdminId();
  await supabase.from('groups').update({ is_open: isOpen }).eq('id', groupId);
  revalidatePath('/groups');
}

export async function kickMember(groupId: string, userId: string, reason: string) {
  const { supabase, adminId } = await getAdminId();
  await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
  await supabase.from('moderation_actions').insert({
    admin_id: adminId,
    target_user_id: userId,
    action_type: 'warn',
    reason: `Kické du salon: ${reason}`,
  });
  await supabase.from('user_notifications').insert({
    user_id: userId,
    type: 'warning',
    title: 'Tu as été retiré·e d\'un salon',
    message: reason,
  });
  revalidatePath('/groups');
}
