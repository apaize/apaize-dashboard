// ============================================================
// 🏠 Dashboard Home — KPIs vue d'ensemble
// ============================================================
import { Users, ShieldAlert, MessagesSquare, Sparkles, Hash, Moon, Heart, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/stat-card';
import { timeAgo } from '@/lib/utils';

// On désactive le cache pour avoir des chiffres à jour à chaque visite
export const dynamic = 'force-dynamic';

export default async function DashboardHomePage() {
  const supabase = await createClient();

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    usersTotal,
    usersBanned,
    angelsTotal,
    pendingReports,
    sessionsToday,
    activeSosNow,
    moodToday,
    crisisLast7,
    recentReports,
    recentSessions,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).not('banned_until', 'is', null),
    supabase.from('angel_profiles').select('id', { count: 'exact', head: true }).eq('is_angel', true),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('angel_sessions').select('id', { count: 'exact', head: true }).gte('created_at', startOfDay),
    supabase.from('angel_sessions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('mood_entries').select('id', { count: 'exact', head: true }).gte('created_at', startOfDay),
    supabase.from('crisis_interventions').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    supabase.from('reports').select('id, reason, status, created_at, reported_user_id, message_id').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    supabase.from('angel_sessions').select('id, urgency, status, created_at, caller_id, angel_id').order('created_at', { ascending: false }).limit(5),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Vue d'ensemble
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Tout ce qui se passe sur Apaize en temps réel
        </p>
      </div>

      {/* === KPIs principaux === */}
      <div>
        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Communauté
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Utilisateurs"
            value={usersTotal.count ?? 0}
            hint={`${usersBanned.count ?? 0} banni·e·s`}
            icon={Users}
            color="serenity"
            href="/users"
          />
          <StatCard
            label="Anges Apaize"
            value={angelsTotal.count ?? 0}
            hint="Actifs sur l'app"
            icon={Sparkles}
            color="hearts"
            href="/anges"
          />
          <StatCard
            label="Check-ins humeur"
            value={moodToday.count ?? 0}
            hint="Aujourd'hui"
            icon={Heart}
            color="breath"
          />
          <StatCard
            label="Sessions SOS actives"
            value={activeSosNow.count ?? 0}
            hint="En cours maintenant"
            icon={MessagesSquare}
            color="gold"
            href="/conversations"
          />
        </div>
      </div>

      {/* === Modération === */}
      <div>
        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Modération
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Signalements en attente"
            value={pendingReports.count ?? 0}
            hint="À traiter"
            icon={ShieldAlert}
            color="coral"
            href="/moderation"
          />
          <StatCard
            label="Sessions SOS aujourd'hui"
            value={sessionsToday.count ?? 0}
            hint="Demandes du jour"
            icon={Moon}
            color="douceur"
            href="/conversations"
          />
          <StatCard
            label="Interventions de crise (7j)"
            value={crisisLast7.count ?? 0}
            hint="Mots-clés crisis détectés"
            icon={AlertTriangle}
            color="coral"
          />
          <StatCard
            label="Salons actifs"
            value="—"
            hint="Voir la liste"
            icon={Hash}
            color="serenity"
            href="/groups"
          />
        </div>
      </div>

      {/* === Activité récente === */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Signalements récents */}
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ShieldAlert size={16} className="text-[var(--coral)]" />
              Derniers signalements
            </h3>
            <a href="/moderation" className="text-xs text-[var(--serenity)] hover:underline">Tout voir →</a>
          </div>
          {recentReports.data && recentReports.data.length > 0 ? (
            <ul className="space-y-2">
              {recentReports.data.map((r: any) => (
                <li key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 text-sm">
                  <div className="w-7 h-7 rounded-full bg-[var(--coral)]/15 flex items-center justify-center">
                    <ShieldAlert size={12} className="text-[var(--coral)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{r.reason || 'Signalement'}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{timeAgo(r.created_at)}</div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--coral)]/20 text-[var(--coral)] font-bold uppercase">
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-[var(--text-muted)] text-center py-8">
              ✨ Aucun signalement en attente — tout va bien.
            </div>
          )}
        </div>

        {/* Sessions SOS récentes */}
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MessagesSquare size={16} className="text-[var(--gold)]" />
              Dernières sessions SOS
            </h3>
            <a href="/conversations" className="text-xs text-[var(--serenity)] hover:underline">Tout voir →</a>
          </div>
          {recentSessions.data && recentSessions.data.length > 0 ? (
            <ul className="space-y-2">
              {recentSessions.data.map((s: any) => (
                <li key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 text-sm">
                  <div className="w-7 h-7 rounded-full bg-[var(--gold)]/15 flex items-center justify-center text-xs">
                    {s.urgency === 'panic' ? '🚨' : s.urgency === 'dark' ? '🌑' : s.urgency === 'rising' ? '⚡' : '💬'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium capitalize">{s.urgency}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{timeAgo(s.created_at)}</div>
                  </div>
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
                    style={{
                      background: s.status === 'active' ? 'rgba(94,205,186,0.20)' : 'rgba(255,255,255,0.05)',
                      color: s.status === 'active' ? '#5ecdba' : 'rgba(245,247,255,0.55)',
                    }}
                  >
                    {s.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-[var(--text-muted)] text-center py-8">
              Aucune session récente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
