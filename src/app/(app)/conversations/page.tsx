// ============================================================
// 💬 Conversations — sessions SOS (angel_sessions)
// ============================================================
import Link from 'next/link';
import { MessagesSquare, AlertTriangle, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { timeAgo, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const URGENCY_STYLE: Record<string, { emoji: string; color: string }> = {
  panic: { emoji: '🚨', color: '#f08585' },
  dark: { emoji: '🌑', color: '#8da7ff' },
  rising: { emoji: '⚡', color: '#ffd58e' },
  general: { emoji: '💬', color: '#6ca8ff' },
};

const STATUS_STYLE: Record<string, string> = {
  matching: '#ffd58e',
  active: '#5ecdba',
  ended: '#6ca8ff',
  cancelled: '#8da7ff',
  no_angel_found: '#f08585',
};

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? 'all';

  const supabase = await createClient();

  let query = supabase
    .from('angel_sessions')
    .select('id, urgency, status, created_at, ended_at, duration_minutes, caller_id, angel_id, reported, reviewed_by_mod, report_reason, caller_rating')
    .order('created_at', { ascending: false })
    .limit(100);

  if (filter === 'reported') query = query.eq('reported', true);
  if (filter === 'active') query = query.eq('status', 'active');
  if (filter === 'panic') query = query.eq('urgency', 'panic');

  const { data: sessions } = await query;

  // Pull user profiles
  const userIds = new Set<string>();
  sessions?.forEach((s: any) => {
    if (s.caller_id) userIds.add(s.caller_id);
    if (s.angel_id) userIds.add(s.angel_id);
  });
  const { data: users } = userIds.size
    ? await supabase.from('profiles').select('id, username').in('id', Array.from(userIds))
    : { data: [] };
  const usersMap = new Map((users ?? []).map((u: any) => [u.id, u.username]));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <MessagesSquare className="text-[var(--gold)]" size={28} />
          Sessions SOS
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Conversations 1:1 entre callers et Anges Apaize
        </p>
      </div>

      {/* Tabs filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'active', label: 'En cours', color: 'var(--breath)' },
          { key: 'reported', label: 'Signalées', color: 'var(--coral)' },
          { key: 'panic', label: 'Urgence panique', color: 'var(--coral)' },
        ].map((t) => {
          const active = filter === t.key;
          return (
            <a
              key={t.key}
              href={`?filter=${t.key}`}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors border"
              style={{
                background: active ? `${t.color ?? 'var(--serenity)'}15` : 'var(--bg-card)',
                borderColor: active ? `${t.color ?? 'var(--serenity)'}50` : 'var(--border-soft)',
                color: active ? (t.color ?? 'var(--serenity)') : 'var(--text-secondary)',
              }}
            >
              {t.label}
            </a>
          );
        })}
      </div>

      {/* Sessions list */}
      <div className="space-y-2">
        {sessions && sessions.length > 0 ? (
          sessions.map((s: any) => {
            const urg = URGENCY_STYLE[s.urgency] ?? URGENCY_STYLE.general;
            const statusColor = STATUS_STYLE[s.status] ?? 'var(--text-secondary)';
            return (
              <Link
                key={s.id}
                href={`/conversations/${s.id}`}
                className="block p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-soft)] hover:border-[var(--border-medium)] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${urg.color}15`, border: `1px solid ${urg.color}40` }}
                  >
                    {urg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-white capitalize">{s.urgency}</span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{ background: `${statusColor}20`, color: statusColor }}
                      >
                        {s.status}
                      </span>
                      {s.reported && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--coral)]/20 text-[var(--coral)] font-bold uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle size={9} /> Signalée
                        </span>
                      )}
                      {s.caller_rating && (
                        <span className="text-[10px] text-[var(--gold)] font-bold">
                          {'★'.repeat(s.caller_rating)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[var(--text-muted)]">
                      <span>👤 {(s.caller_id ? usersMap.get(s.caller_id) : null) || `${s.caller_id?.slice(0, 8)}…`}</span>
                      <span>🌟 {s.angel_id ? (usersMap.get(s.angel_id) || `${s.angel_id?.slice(0, 8)}…`) : <em>pas encore matché</em>}</span>
                      {s.duration_minutes != null && <span>⏱ {s.duration_minutes}min</span>}
                      <span>{timeAgo(s.created_at)}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
            <div className="text-4xl mb-3">💤</div>
            <div className="text-[var(--text-secondary)]">Aucune session pour ce filtre.</div>
          </div>
        )}
      </div>
    </div>
  );
}
