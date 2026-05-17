// ============================================================
// 📣 Broadcast — envoyer une notification à un segment d'users
// ============================================================
import { Megaphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BroadcastForm } from './broadcast-form';

export const dynamic = 'force-dynamic';

export default async function BroadcastPage() {
  const supabase = await createClient();
  const { data: groups } = await supabase
    .from('groups')
    .select('id, theme_slug, number')
    .order('theme_slug')
    .order('number');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Megaphone className="text-[var(--gold)]" size={28} />
          Broadcast
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Envoie une notification in-app à un groupe d'utilisateurs
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-medium)]">
        <BroadcastForm groups={groups ?? []} />
      </div>

      <div className="p-4 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-xs text-[var(--text-secondary)]">
        💡 <strong className="text-white">Note :</strong> ces notifications apparaissent dans
        l'app via la table <code className="text-[var(--gold)]">user_notifications</code>.
        Les push notifications iOS/Android nécessitent une intégration séparée (Expo Notifications)
        — pas encore branché.
      </div>
    </div>
  );
}
