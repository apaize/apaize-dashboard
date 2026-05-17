'use client';

import { useState, useTransition } from 'react';
import { ShieldOff, ShieldCheck, MoreVertical, GraduationCap } from 'lucide-react';
import { suspendAngel, unsuspendAngel, setAngelLevel, forceQuizPassed } from './actions';

const LEVELS = ['bronze', 'silver', 'gold', 'diamond'] as const;

export function AngelActionsMenu({
  userId,
  isSuspended,
  currentLevel,
  quizPassed,
}: {
  userId: string;
  isSuspended: boolean;
  currentLevel: string;
  quizPassed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<null | 'suspend' | 'level'>(null);
  const [reason, setReason] = useState('');
  const [hours, setHours] = useState(24);
  const [level, setLevel] = useState(currentLevel);
  const [pending, start] = useTransition();

  const submit = () => {
    start(async () => {
      if (modal === 'suspend') await suspendAngel(userId, hours, reason);
      if (modal === 'level') await setAngelLevel(userId, level as any);
      setModal(null);
      setOpen(false);
      setReason('');
    });
  };

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-white/10">
        <MoreVertical size={14} className="text-[var(--text-secondary)]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-52 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-medium)] shadow-2xl z-40 py-1">
            {isSuspended ? (
              <button
                onClick={() => start(() => unsuspendAngel(userId).then(() => setOpen(false)))}
                disabled={pending}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2.5 text-[var(--breath)]"
              >
                <ShieldCheck size={14} /> Réactiver l'Ange
              </button>
            ) : (
              <button
                onClick={() => setModal('suspend')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2.5 text-[var(--coral)]"
              >
                <ShieldOff size={14} /> Suspendre
              </button>
            )}
            <button
              onClick={() => setModal('level')}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2.5"
            >
              <span className="text-base">⭐</span> Changer le niveau
            </button>
            {!quizPassed && (
              <button
                onClick={() => start(() => forceQuizPassed(userId).then(() => setOpen(false)))}
                disabled={pending}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2.5 text-[var(--gold)]"
              >
                <GraduationCap size={14} /> Valider quiz manuellement
              </button>
            )}
          </div>
        </>
      )}

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-md mx-4 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-medium)]"
            onClick={(e) => e.stopPropagation()}
          >
            {modal === 'suspend' && (
              <>
                <h3 className="text-lg font-bold mb-3">Suspendre cet Ange</h3>
                <label className="block text-xs font-bold text-[var(--serenity)] uppercase mb-2">Durée</label>
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full px-3 py-2.5 mb-3 rounded-lg bg-white/5 border border-[var(--border-medium)] text-white"
                >
                  <option value={24}>24h</option>
                  <option value={72}>3 jours</option>
                  <option value={168}>7 jours</option>
                  <option value={720}>30 jours</option>
                  <option value={0}>Définitif</option>
                </select>
                <label className="block text-xs font-bold text-[var(--serenity)] uppercase mb-2">Raison</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 mb-5 rounded-lg bg-white/5 border border-[var(--border-medium)] text-white text-sm resize-none"
                />
              </>
            )}
            {modal === 'level' && (
              <>
                <h3 className="text-lg font-bold mb-3">Changer le niveau</h3>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2.5 mb-5 rounded-lg bg-white/5 border border-[var(--border-medium)] text-white capitalize"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </>
            )}
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-semibold">
                Annuler
              </button>
              <button
                onClick={submit}
                disabled={(modal === 'suspend' && !reason) || pending}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--serenity)] hover:opacity-90 text-white text-sm font-bold disabled:opacity-50"
              >
                {pending ? '…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
