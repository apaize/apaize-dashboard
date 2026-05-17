'use server';

// ============================================================
// 🛡️ Server Actions — modération signalements
// ============================================================
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function resolveReport(reportId: string, status: 'resolved' | 'dismissed') {
  const supabase = await createClient();
  await supabase.from('reports').update({ status }).eq('id', reportId);
  revalidatePath('/moderation');
}

export async function hideMessage(messageId: string, reason: string) {
  const supabase = await createClient();
  await supabase
    .from('messages')
    .update({
      hidden: true,
      hidden_reason: reason,
      hidden_at: new Date().toISOString(),
    })
    .eq('id', messageId);
  revalidatePath('/moderation');
}

export async function unhideMessage(messageId: string) {
  const supabase = await createClient();
  await supabase
    .from('messages')
    .update({ hidden: false, hidden_reason: null, hidden_at: null })
    .eq('id', messageId);
  revalidatePath('/moderation');
}
