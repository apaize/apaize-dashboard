// ============================================================
// # Groups (Salons) — liste des salons + activité
// ============================================================
import Link from 'next/link';
import { Hash, Users as UsersIcon, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { timeAgo } from '@/lib/utils';
import { ToggleGroupOpen } from './group-actions';

export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
  const supabase = await createClient();

  const { data: groups } = await supabase
    .from('groups')
    .select('id, theme_slug, number, max_members, current_active_count, is_open, last_activity_at, created_at')
    .order('last_activity_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Hash className="text-[var(--serenity)]" size={28} />
          Salons
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {groups?.length ?? 0} salons par thématique d'anxiété
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups && groups.length > 0 ? (
          groups.map((g: any) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] hover:border-[var(--border-medium)] transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--serenity)]/15 border border-[var(--serenity)]/30 flex items-center justify-center">
                  <Hash size={16} className="text-[var(--serenity)]" />
                </div>
                <ToggleGroupOpen groupId={g.id} isOpen={!!g.is_open} />
              </div>

              <div className="font-bold text-white mb-1">
                #{g.theme_slug}-{g.number}
              </div>
              <div className="text-xs text-[var(--text-muted)] mb-3">
                Dernier message : {timeAgo(g.last_activity_at)}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                  <UsersIcon size={12} />
                  <span className="font-semibold">{g.current_active_count}/{g.max_members}</span>
                </div>
                <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--serenity)] transition-colors" />
              </div>
            </Link>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 text-center py-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
            <div className="text-4xl mb-3">💬</div>
            <div className="text-[var(--text-secondary)]">Aucun salon créé pour l'instant.</div>
          </div>
        )}
      </div>
    </div>
  );
}
