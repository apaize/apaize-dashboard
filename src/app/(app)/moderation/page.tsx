// ============================================================
// 🛡️ Modération — signalements en attente + historique
// ============================================================
import { ShieldAlert, Flag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ReportActions } from './report-actions';
import { timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab ?? 'pending';

  const supabase = await createClient();

  const [pendingCount, resolvedCount, dismissedCount, reports] = await Promise.all([
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'dismissed'),
    supabase
      .from('reports')
      .select(`
        id, reason, details, status, created_at, message_id, group_id,
        reporter:reporter_id (id),
        reported_user:reported_user_id (id),
        message:message_id (id, content, hidden, user_id)
      `)
      .eq('status', tab)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  // Récupération nom/email des reporters et reportés (depuis profiles séparément, vu les FK sur auth.users)
  const userIds = new Set<string>();
  reports.data?.forEach((r: any) => {
    if (r.reporter?.id) userIds.add(r.reporter.id);
    if (r.reported_user?.id) userIds.add(r.reported_user.id);
    if (r.message?.user_id) userIds.add(r.message.user_id);
  });
  const { data: usersData } = userIds.size
    ? await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', Array.from(userIds))
    : { data: [] };
  const usersMap = new Map<string, { username: string | null; avatar_url: string | null }>();
  (usersData ?? []).forEach((u: any) => usersMap.set(u.id, u));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ShieldAlert className="text-[var(--coral)]" size={28} />
          Modération
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Signalements et actions de modération
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-soft)]">
        {[
          { key: 'pending', label: 'En attente', count: pendingCount.count ?? 0, color: 'var(--coral)' },
          { key: 'resolved', label: 'Résolus', count: resolvedCount.count ?? 0, color: 'var(--breath)' },
          { key: 'dismissed', label: 'Rejetés', count: dismissedCount.count ?? 0, color: 'var(--text-muted)' },
        ].map((t) => {
          const active = tab === t.key;
          return (
            <a
              key={t.key}
              href={`?tab=${t.key}`}
              className="px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2"
              style={{
                borderColor: active ? t.color : 'transparent',
                color: active ? t.color : 'var(--text-secondary)',
              }}
            >
              {t.label}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: `${active ? t.color : 'rgba(255,255,255,0.08)'}`, color: active ? '#fff' : 'var(--text-muted)', opacity: active ? 0.4 : 1 }}
              >
                {t.count}
              </span>
            </a>
          );
        })}
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {reports.data && reports.data.length > 0 ? (
          reports.data.map((r: any) => {
            const reporterId = r.reporter?.id;
            const reportedId = r.reported_user?.id;
            const reporter = reporterId ? usersMap.get(reporterId) : null;
            const reported = reportedId ? usersMap.get(reportedId) : null;
            const message = r.message;

            return (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] hover:border-[var(--border-medium)] transition-all"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--coral)]/15 border border-[var(--coral)]/30 flex items-center justify-center flex-shrink-0">
                    <Flag size={16} className="text-[var(--coral)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-white">{r.reason || 'Signalement'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-muted)] uppercase tracking-wider">
                        {r.status}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">• {timeAgo(r.created_at)}</span>
                    </div>
                    {r.details && (
                      <p className="text-sm text-[var(--text-secondary)] mb-2">{r.details}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                      <span>
                        <strong className="text-white/70">Reporter :</strong>{' '}
                        {reporter?.username || reporterId?.slice(0, 8) || '—'}
                      </span>
                      <span>
                        <strong className="text-white/70">Reporté :</strong>{' '}
                        {reported?.username || reportedId?.slice(0, 8) || '—'}
                      </span>
                    </div>
                  </div>
                  {tab === 'pending' && (
                    <ReportActions reportId={r.id} messageId={message?.id ?? null} />
                  )}
                </div>

                {/* Message en cause (si présent) */}
                {message && (
                  <div className={`mt-3 p-3 rounded-xl border ${message.hidden ? 'bg-white/5 border-white/10 opacity-50' : 'bg-[var(--coral)]/5 border-[var(--coral)]/20'}`}>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 flex items-center gap-1.5">
                      💬 Message signalé
                      {message.hidden && <span className="text-[var(--coral)] font-bold">— déjà masqué</span>}
                    </div>
                    <p className="text-sm text-white/90 italic">"{message.content}"</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
            <div className="text-4xl mb-3">✨</div>
            <div className="text-[var(--text-secondary)]">
              Aucun signalement <strong className="text-white">{tab}</strong>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
