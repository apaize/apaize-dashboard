// ============================================================
// 👤 User detail — fiche complète d'un utilisateur
// ============================================================
import Link from 'next/link';
import { ArrowLeft, Calendar, AtSign, ShieldAlert, Heart, Moon, MessagesSquare, ScrollText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatDateTime, timeAgo } from '@/lib/utils';
import { UserActionsMenu } from '../user-actions-menu';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [profileRes, moodsRes, sleepsRes, sessionsRes, reportsRes, modActionsRes, angelRes] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
      supabase.from('mood_entries').select('id, mood, intensity, created_at, note').eq('user_id', id).order('created_at', { ascending: false }).limit(50),
      supabase.from('sleep_entries').select('id, date, hours, quality').eq('user_id', id).order('date', { ascending: false }).limit(50),
      supabase.from('angel_sessions').select('id, urgency, status, created_at, duration_minutes, caller_rating').or(`caller_id.eq.${id},angel_id.eq.${id}`).order('created_at', { ascending: false }).limit(20),
      supabase.from('reports').select('id, reason, status, created_at, reporter_id').eq('reported_user_id', id).order('created_at', { ascending: false }).limit(20),
      supabase.from('moderation_actions').select('id, action_type, reason, created_at, admin_id, duration_hours').eq('target_user_id', id).order('created_at', { ascending: false }).limit(50),
      supabase.from('angel_profiles').select('*').eq('user_id', id).maybeSingle(),
    ]);

  const profile = profileRes.data;
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-[var(--text-secondary)]">
        Utilisateur introuvable.
      </div>
    );
  }

  const isBanned = profile.banned_until && new Date(profile.banned_until) > new Date();
  const isMuted = profile.muted_until && new Date(profile.muted_until) > new Date();

  const stats = [
    { label: 'Humeurs', value: moodsRes.data?.length ?? 0, icon: Heart, color: 'var(--breath)' },
    { label: 'Nuits', value: sleepsRes.data?.length ?? 0, icon: Moon, color: 'var(--douceur)' },
    { label: 'Sessions SOS', value: sessionsRes.data?.length ?? 0, icon: MessagesSquare, color: 'var(--gold)' },
    { label: 'Signalements reçus', value: reportsRes.data?.length ?? 0, icon: ShieldAlert, color: 'var(--coral)' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/users" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white">
        <ArrowLeft size={14} /> Tous les utilisateurs
      </Link>

      {/* Hero card */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-medium)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--serenity)] to-[var(--douceur)] flex items-center justify-center text-2xl font-bold text-white">
              {(profile.username?.[0] || profile.email?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold">{profile.username || <em className="text-[var(--text-muted)]">sans pseudo</em>}</h1>
                {profile.is_admin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-bold uppercase">Admin</span>
                )}
                {angelRes.data?.is_angel && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--hearts)]/20 text-[var(--hearts)] font-bold uppercase capitalize">
                    Ange {angelRes.data.level}
                  </span>
                )}
                {isBanned && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--coral)]/15 text-[var(--coral)] font-bold uppercase border border-[var(--coral)]/30">
                    Banni
                  </span>
                )}
                {isMuted && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--douceur)]/15 text-[var(--douceur)] font-bold uppercase border border-[var(--douceur)]/30">
                    Muet
                  </span>
                )}
              </div>
              <div className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                <AtSign size={12} /> {profile.email || 'pas d\'email'}
              </div>
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                <Calendar size={11} /> Inscrit {timeAgo(profile.created_at)} • <span className="font-mono">{profile.id.slice(0, 8)}…</span>
              </div>
            </div>
          </div>
          {!profile.is_admin && (
            <UserActionsMenu userId={profile.id} isMuted={!!isMuted} isBanned={!!isBanned} />
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-[var(--text-secondary)] mt-4 italic">"{profile.bio}"</p>
        )}

        {profile.ban_reason && (
          <div className="mt-4 p-3 rounded-xl bg-[var(--coral)]/10 border border-[var(--coral)]/30 text-sm">
            <div className="text-[10px] uppercase tracking-wider text-[var(--coral)] font-bold mb-1">Raison du ban</div>
            {profile.ban_reason}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} style={{ color: s.color }} />
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{s.label}</div>
              </div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Récente activité */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
          <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <ScrollText size={14} /> Historique modération
          </h3>
          {modActionsRes.data && modActionsRes.data.length > 0 ? (
            <ul className="space-y-2">
              {modActionsRes.data.map((a: any) => (
                <li key={a.id} className="text-sm p-2 rounded-lg bg-white/3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize text-white">{a.action_type}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(a.created_at)}</span>
                  </div>
                  {a.reason && <div className="text-xs text-[var(--text-muted)] italic mt-0.5">"{a.reason}"</div>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-[var(--text-muted)] text-center py-6">Aucune action modération.</div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
          <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldAlert size={14} /> Signalements reçus
          </h3>
          {reportsRes.data && reportsRes.data.length > 0 ? (
            <ul className="space-y-2">
              {reportsRes.data.map((r: any) => (
                <li key={r.id} className="text-sm p-2 rounded-lg bg-white/3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{r.reason}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-[var(--text-muted)] uppercase">
                      {r.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">{timeAgo(r.created_at)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-[var(--text-muted)] text-center py-6">Aucun signalement.</div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
          <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Heart size={14} /> Humeurs récentes
          </h3>
          {moodsRes.data && moodsRes.data.length > 0 ? (
            <ul className="space-y-1">
              {moodsRes.data.slice(0, 10).map((m: any) => (
                <li key={m.id} className="text-sm flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="capitalize text-white">{m.mood}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(m.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-[var(--text-muted)] text-center py-6">Aucun check-in.</div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
          <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessagesSquare size={14} /> Sessions SOS
          </h3>
          {sessionsRes.data && sessionsRes.data.length > 0 ? (
            <ul className="space-y-1">
              {sessionsRes.data.slice(0, 10).map((s: any) => (
                <li key={s.id} className="text-sm flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="capitalize text-white">
                    {s.urgency} <span className="text-[10px] text-[var(--text-muted)]">— {s.status}</span>
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(s.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-[var(--text-muted)] text-center py-6">Aucune session.</div>
          )}
        </div>
      </div>
    </div>
  );
}
