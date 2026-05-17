'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function admin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return { supabase, adminId: user.id };
}

export async function addBannedWord(word: string, severity: 'block' | 'flag' | 'crisis', category: string) {
  const { supabase, adminId } = await admin();
  await supabase.from('banned_words').insert({
    word: word.toLowerCase().trim(),
    severity,
    category,
    added_by: adminId,
  });
  revalidatePath('/content');
}

export async function removeBannedWord(id: string) {
  const { supabase } = await admin();
  await supabase.from('banned_words').delete().eq('id', id);
  revalidatePath('/content');
}

export async function toggleSparkActive(key: string, isActive: boolean) {
  const { supabase } = await admin();
  await supabase.from('spark_templates').update({ is_active: !isActive }).eq('key', key);
  revalidatePath('/content');
}

export async function toggleThemePublished(id: string, isPublished: boolean) {
  const { supabase } = await admin();
  await supabase.from('themes').update({ is_published: !isPublished }).eq('id', id);
  revalidatePath('/content');
}
