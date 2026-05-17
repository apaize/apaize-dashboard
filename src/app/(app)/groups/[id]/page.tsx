// ============================================================
// 💬 Détail salon — membres + derniers messages
// ============================================================
import Link from 'next/link';
import { ArrowLeft, Hash, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { timeAgo } from '@/lib/utils';
import { HideMessageBtn, KickMemberBtn, ToggleGroupOpen } from '../group-actions';

export const dynamic = 'force-dynamic';

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [groupRes, membersRes, messagesRes] = await Promise.all([
    supabase.from('groups').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('group_members')
      .select('user_id, joined_at, activity_status')
      .eq('group_id', id)
      .order('joined_at', { ascending: false })
      .limit(50),
    supabase
      .from('messages')
      .select('id, user_id, content, hidden, hidden_reason, created_at, edited_at')
      .eq('group_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const group = groupRes.data;
  const members = membersRes.data ?? [];
  const messages = messagesRes.data ?? [];

  const userIds = new Set<string>();
  members.forEach((m: any) => userIds.add(m.user_id));
  messages.forEach((m: any) => userIds.add(m.user_id));

  const { data: users } = userIds.size
    ? await supabase.from('profiles').select('id, username, avatar_url').in('id', Array.from(userIds))
    : { data: [] };
  const usersMap = new Map((users ?? []).map((u: any) => [u.id, u]));

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-[var(--text-secondary)]">
        Salon introuvable.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href="/groups" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white">
        <ArrowLeft size={14} /> Tous les salons
      </Link>

      {/* Header */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-medium)]">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <Hash size={20} className="text-[var(--serenity)]" />
            <h1 className="text-2xl font-bold">#{group.theme_slug}-{group.number}</h1>
          </div>
          <ToggleGroupOpen groupId={group.id} isOpen={!!group.is_open} />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--text-secondary)]">
          <span><strong className="text-white">{members.length}</strong> membres</span>
          <span><strong className="text-white">{messages.length}</strong> messages</span>
          <span>Dernier message : {timeAgo(group.last_activity_at)}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Members */}
        <div className="md:col-span-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] p-5">
          <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Membres ({members.length})
          </h2>
          <ul className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {members.map((m: any) => {
              const u: any = usersMap.get(m.user_id);
              return (
                <li key={m.user_id} className="group flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--serenity)] to-[var(--douceur)] flex items-center justify-center text-[10px] font-bold text-white">
                    {(u?.username?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{u?.username || m.user_id.slice(0, 8)}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{timeAgo(m.joined_at)}</div>
                  </div>
                  <KickMemberBtn groupId={group.id} userId={m.user_id} />
                </li>
              );
            })}
          </ul>
        </div>

        {/* Messages */}
        <div className="md:col-span-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] p-5">
          <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Derniers messages
          </h2>
          <ul className="space-y-3 max-h-[600px] overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-sm text-[var(--text-muted)] text-center py-8">
                Aucun message dans ce salon.
              </div>
            )}
            {messages.map((m: any) => {
              const u: any = usersMap.get(m.user_id);
              return (
                <li key={m.id} className={`p-3 rounded-xl ${m.hidden ? 'bg-white/5 opacity-50' : 'bg-white/3 border border-white/5'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--serenity)] to-[var(--douceur)] flex items-center justify-center text-[9px] font-bold text-white">
                      {(u?.username?.[0] || '?').toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-white">{u?.username || m.user_id.slice(0, 8)}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(m.created_at)}</span>
                    {m.edited_at && <span className="text-[10px] text-[var(--text-muted)] italic">(modifié)</span>}
                    {m.hidden && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--coral)]/20 text-[var(--coral)] font-bold flex items-center gap-1">
                        <EyeOff size={9} /> Masqué
                      </span>
                    )}
                    <div className="ml-auto">
                      <HideMessageBtn messageId={m.id} hidden={!!m.hidden} />
                    </div>
                  </div>
                  <p className="text-sm text-white/90">{m.content}</p>
                  {m.hidden && m.hidden_reason && (
                    <div className="text-[10px] text-[var(--coral)] mt-1 italic">Raison : {m.hidden_reason}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
