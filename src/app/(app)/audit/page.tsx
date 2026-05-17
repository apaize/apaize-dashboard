// ============================================================
// 📜 Audit log — historique de toutes les actions de modération
// ============================================================
import Link from 'next/link';
import { ScrollText, AlertTriangle, VolumeX, Ban, EyeOff, Volume2, ShieldOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { timeAgo, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const ACTION_STYLE: Record<string, { icon: any; color: string; label: string }> = {
  warn: { icon: AlertTriangle, color: '#ffd58e', label: 'Avertissement' },
  mute: { icon: VolumeX, color: '#8da7ff', label: 'Mute' },
  ban: { icon: Ban, color: '#f08585', label: 'Ban' },
  delete_message: { icon: EyeOff, color: '#f5a4c4', label: 'Suppression message' },
  unmute: { icon: Volume2, color: '#5ecdba', label: 'Unmute' },
  unban: { icon: ShieldOff, color: '#5ecdba', label: 'Unban' },
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? 'all';

  const supabase = await createClient();

  let query = supabase
    .from('moderation_actions')
    .select('id, created_at, admin_id, target_user_id, action_type, duration_hours, expires_at, reason, report_id')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filter !== 'all') query = query.eq('action_type', filter);

  const { data: actions } = await query;

  // Resolve user names
  const userIds = new Set<string>();
  actions?.forEach((a: any) => {
    if (a.admin_id) userIds.add(a.admin_id);
    if (a.target_user_id) userIds.add(a.target_user_id);
  });
  const { data: users } = userIds.size
    ? await supabase.from('profiles').select('id, username').in('id', Array.from(userIds))
    : { data: [] };
  const usersMap = new Map((users ?? []).map((u: any) => [u.id, u.username]));

  const FILTERS = [
    { key: 'all', label: 'Toutes' },
    { key: 'warn', label: 'Warns' },
    { key: 'mute', label: 'Mutes' },
    { key: 'ban', label: 'Bans' },
    { key: 'delete_message', label: 'Suppressions' },
    { key: 'unmute', label: 'Unmute' },
    { key: 'unban', label: 'Unban' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ScrollText className="text-[var(--douceur)]" size={28} />
          Audit log
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Toutes les actions de modération, dans l'ordre chronologique inverse
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <a
              key={f.key}
              href={`?filter=${f.key}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
              style={{
                background: active ? 'var(--serenity)' : 'var(--bg-card)',
                borderColor: active ? 'var(--serenity)' : 'var(--border-soft)',
                color: active ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {f.label}
            </a>
          );
        })}
      </div>

      <div className="space-y-2">
        {actions?.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] text-[var(--text-muted)]">
            ✨ Aucune action de modération pour ce filtre.
          </div>
        )}
        {actions?.map((a: any) => {
          const style = ACTION_STYLE[a.action_type] ?? ACTION_STYLE.warn;
          const Icon = style.icon;
          return (
            <div
              key={a.id}
              className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-soft)] flex items-start gap-4"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
                style={{ background: `${style.color}15`, borderColor: `${style.color}40`, color: style.color }}
              >
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{style.label}</span>
                  {a.duration_hours != null && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-[var(--text-muted)]">
                      {a.duration_hours === 0 ? 'définitif' : `${a.duration_hours}h`}
                    </span>
                  )}
                  <span className="text-[10px] text-[var(--text-muted)] ml-auto" title={formatDateTime(a.created_at)}>
                    {timeAgo(a.created_at)}
                  </span>
                </div>
                <div className="text-sm text-[var(--text-secondary)] mb-1">
                  <Link href={`/users/${a.admin_id}`} className="text-[var(--serenity)] hover:underline">
                    {usersMap.get(a.admin_id) || a.admin_id?.slice(0, 8)}
                  </Link>
                  <span className="text-[var(--text-muted)]"> → </span>
                  <Link href={`/users/${a.target_user_id}`} className="text-white hover:underline">
                    {usersMap.get(a.target_user_id) || a.target_user_id?.slice(0, 8)}
                  </Link>
                </div>
                {a.reason && <p className="text-xs text-[var(--text-secondary)] italic">"{a.reason}"</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
