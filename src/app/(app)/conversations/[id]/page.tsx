// ============================================================
// 💬 Détail d'une session SOS — viewer messages
// ⚠️ Lecture admin : on respecte la vie privée → uniquement pour
// les sessions signalées ou les audits autorisés
// ============================================================
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Flag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDateTime, timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('angel_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-[var(--text-secondary)]">Session introuvable.</p>
        <Link href="/conversations" className="text-[var(--serenity)] hover:underline mt-3 inline-block">
          ← Retour
        </Link>
      </div>
    );
  }

  const { data: messages } = await supabase
    .from('angel_session_messages')
    .select('id, sender_id, content, flagged, flag_reason, toxicity_score, sent_at')
    .eq('session_id', id)
    .order('sent_at', { ascending: true });

  const userIds = new Set<string>();
  if (session.caller_id) userIds.add(session.caller_id);
  if (session.angel_id) userIds.add(session.angel_id);
  messages?.forEach((m: any) => userIds.add(m.sender_id));

  const { data: users } = userIds.size
    ? await supabase.from('profiles').select('id, username').in('id', Array.from(userIds))
    : { data: [] };
  const usersMap = new Map((users ?? []).map((u: any) => [u.id, u.username]));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/conversations"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white"
      >
        <ArrowLeft size={14} /> Toutes les sessions
      </Link>

      {/* Header session */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-medium)]">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <div>
            <h1 className="text-xl font-bold mb-1">Session SOS</h1>
            <div className="text-xs text-[var(--text-muted)] font-mono">{session.id}</div>
          </div>
          {session.reported && (
            <span className="px-3 py-1 rounded-full bg-[var(--coral)]/15 border border-[var(--coral)]/40 text-xs font-bold text-[var(--coral)] flex items-center gap-1.5">
              <AlertTriangle size={11} /> Signalée
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Urgence</div>
            <div className="font-bold capitalize">{session.urgency}</div>
          </div>
          <div>
            <div className="text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Statut</div>
            <div className="font-bold capitalize">{session.status}</div>
          </div>
          <div>
            <div className="text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Durée</div>
            <div className="font-bold">{session.duration_minutes ?? '—'} min</div>
          </div>
          <div>
            <div className="text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Note caller</div>
            <div className="font-bold text-[var(--gold)]">
              {session.caller_rating ? '★'.repeat(session.caller_rating) : '—'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
          <div>
            <div className="text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Caller</div>
            <div>{(session.caller_id && usersMap.get(session.caller_id)) || session.caller_id}</div>
          </div>
          <div>
            <div className="text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Ange</div>
            <div>{(session.angel_id && usersMap.get(session.angel_id)) || session.angel_id || <em className="text-[var(--text-muted)]">non matché</em>}</div>
          </div>
        </div>

        {session.report_reason && (
          <div className="mt-3 p-3 rounded-xl bg-[var(--coral)]/10 border border-[var(--coral)]/30">
            <div className="text-[10px] uppercase tracking-wider text-[var(--coral)] font-bold mb-1">Raison du signalement</div>
            <div className="text-sm">{session.report_reason}</div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">
          Conversation ({messages?.length ?? 0} messages)
        </h2>
        {messages && messages.length > 0 ? (
          messages.map((m: any) => {
            const isAngel = m.sender_id === session.angel_id;
            const senderName = usersMap.get(m.sender_id) || m.sender_id?.slice(0, 8);
            return (
              <div
                key={m.id}
                className={`flex ${isAngel ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] ${isAngel ? '' : 'items-end'}`}>
                  <div className="text-[10px] text-[var(--text-muted)] mb-1 px-2">
                    {isAngel ? '🌟' : '👤'} {senderName} • {timeAgo(m.sent_at)}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-sm ${
                      isAngel
                        ? 'bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-tl-sm'
                        : 'bg-[var(--serenity)]/15 border border-[var(--serenity)]/30 rounded-tr-sm'
                    } ${m.flagged ? 'border-[var(--coral)]/50 bg-[var(--coral)]/10' : ''}`}
                  >
                    {m.content}
                    {m.flagged && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-[var(--coral)] flex items-center gap-1">
                        <Flag size={9} />
                        {m.flag_reason || 'Signalé'}
                        {m.toxicity_score != null && ` • toxicité ${(m.toxicity_score * 100).toFixed(0)}%`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] text-[var(--text-muted)] text-sm">
            Aucun message dans cette session.
          </div>
        )}
      </div>
    </div>
  );
}
