// ============================================================
// 🌟 Anges Apaize — liste + niveaux + formation
// ============================================================
import { Sparkles, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, timeAgo } from '@/lib/utils';
import { AngelActionsMenu } from './angel-actions';

export const dynamic = 'force-dynamic';

const LEVEL_STYLE: Record<string, { color: string; emoji: string }> = {
  bronze: { color: '#cd7f32', emoji: '🥉' },
  silver: { color: '#c0c0c0', emoji: '🥈' },
  gold: { color: '#ffd58e', emoji: '🥇' },
  diamond: { color: '#6ca8ff', emoji: '💎' },
};

export default async function AngesPage() {
  const supabase = await createClient();

  const [angelsRes, trainingsRes] = await Promise.all([
    supabase
      .from('angel_profiles')
      .select(`
        id, user_id, is_angel, is_available, level, total_helps,
        training_completed_at, quiz_passed, quiz_score, daily_help_count,
        is_suspended, warning_count, avg_rating, total_ratings,
        bio, languages, specialties, created_at
      `)
      .eq('is_angel', true)
      .order('total_helps', { ascending: false }),
    supabase.from('angel_training_progress').select('*'),
  ]);

  const angels = angelsRes.data ?? [];
  const trainings = trainingsRes.data ?? [];
  const trainingsByUser = new Map(trainings.map((t: any) => [t.user_id, t]));

  const userIds = angels.map((a: any) => a.user_id);
  const { data: users } = userIds.length
    ? await supabase.from('profiles').select('id, username, email, avatar_url').in('id', userIds)
    : { data: [] };
  const usersMap = new Map((users ?? []).map((u: any) => [u.id, u]));

  const totalActive = angels.length;
  const totalAvailable = angels.filter((a: any) => a.is_available).length;
  const totalCertified = angels.filter((a: any) => a.quiz_passed).length;
  const totalSuspended = angels.filter((a: any) => a.is_suspended).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Sparkles className="text-[var(--hearts)]" size={28} />
          Anges Apaize
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {totalActive} bénévoles formés à l'écoute active
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Anges actifs', value: totalActive, color: 'var(--hearts)' },
          { label: 'Disponibles maintenant', value: totalAvailable, color: 'var(--breath)' },
          { label: 'Quiz validé', value: totalCertified, color: 'var(--gold)' },
          { label: 'Suspendus', value: totalSuspended, color: 'var(--coral)' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table Anges */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-[var(--text-muted)] uppercase tracking-wider bg-white/5">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Ange</th>
              <th className="text-left px-4 py-3 font-semibold">Niveau</th>
              <th className="text-left px-4 py-3 font-semibold">Aides</th>
              <th className="text-left px-4 py-3 font-semibold">Note</th>
              <th className="text-left px-4 py-3 font-semibold">Formation</th>
              <th className="text-left px-4 py-3 font-semibold">Statut</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)]">
            {angels.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[var(--text-muted)]">
                  Aucun Ange Apaize pour l'instant.
                </td>
              </tr>
            )}
            {angels.map((a: any) => {
              const u: any = usersMap.get(a.user_id);
              const level = LEVEL_STYLE[a.level] ?? LEVEL_STYLE.bronze;
              const training: any = trainingsByUser.get(a.user_id);
              const videosDone = training
                ? [
                    training.video_intro_done,
                    training.video_listen_done,
                    training.video_limits_done,
                    training.video_emergency_done,
                    training.video_aftercare_done,
                  ].filter(Boolean).length
                : 0;
              return (
                <tr key={a.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--hearts)] to-[var(--douceur)] flex items-center justify-center text-sm font-bold text-white">
                        {(u?.username?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{u?.username || 'sans pseudo'}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{u?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold capitalize"
                      style={{ background: `${level.color}20`, color: level.color, border: `1px solid ${level.color}50` }}
                    >
                      {level.emoji} {a.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-white">{a.total_helps}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">aujourd'hui : {a.daily_help_count}</div>
                  </td>
                  <td className="px-4 py-3">
                    {a.total_ratings > 0 ? (
                      <div>
                        <span className="text-[var(--gold)] font-bold">★ {Number(a.avg_rating).toFixed(1)}</span>
                        <div className="text-[10px] text-[var(--text-muted)]">{a.total_ratings} avis</div>
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)] text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden w-16">
                        <div
                          className="h-full rounded-full bg-[var(--breath)]"
                          style={{ width: `${(videosDone / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)]">{videosDone}/5</span>
                    </div>
                    <div className="text-[10px] mt-0.5">
                      {a.quiz_passed ? (
                        <span className="text-[var(--breath)] font-bold">Quiz ✓ {a.quiz_score}%</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">Quiz en attente</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {a.is_suspended && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--coral)]/15 text-[var(--coral)] font-bold uppercase border border-[var(--coral)]/30 flex items-center gap-1 w-fit">
                          <AlertTriangle size={9} /> Suspendu
                        </span>
                      )}
                      {!a.is_suspended && a.is_available && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--breath)]/15 text-[var(--breath)] font-bold uppercase border border-[var(--breath)]/30 w-fit">
                          ● En ligne
                        </span>
                      )}
                      {!a.is_suspended && !a.is_available && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-muted)] font-bold uppercase w-fit">
                          Hors ligne
                        </span>
                      )}
                      {a.warning_count > 0 && (
                        <span className="text-[10px] text-[var(--gold)] font-bold">⚠ {a.warning_count} avertissements</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AngelActionsMenu
                      userId={a.user_id}
                      isSuspended={!!a.is_suspended}
                      currentLevel={a.level || 'bronze'}
                      quizPassed={!!a.quiz_passed}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
