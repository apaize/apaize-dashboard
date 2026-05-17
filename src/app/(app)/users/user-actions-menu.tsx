'use client';

// ============================================================
// 🛡️ Menu d'actions par user (warn/mute/ban/unban)
// ============================================================
import { useState, useTransition } from 'react';
import { ShieldOff, Volume2, VolumeX, AlertTriangle, Ban, MoreVertical } from 'lucide-react';
import { warnUser, muteUser, banUser, unbanUser, unmuteUser } from './actions';

type Props = {
  userId: string;
  isMuted: boolean;
  isBanned: boolean;
};

export function UserActionsMenu({ userId, isMuted, isBanned }: Props) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<null | 'warn' | 'mute' | 'ban'>(null);
  const [reason, setReason] = useState('');
  const [hours, setHours] = useState<number>(24);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (!reason && modal !== null) return;
    startTransition(async () => {
      if (modal === 'warn') await warnUser(userId, reason);
      if (modal === 'mute') await muteUser(userId, hours, reason);
      if (modal === 'ban') await banUser(userId, hours === 0 ? null : hours, reason);
      setModal(null);
      setReason('');
      setHours(24);
      setOpen(false);
    });
  };

  const handleUnban = () => startTransition(() => unbanUser(userId).then(() => setOpen(false)));
  const handleUnmute = () => startTransition(() => unmuteUser(userId).then(() => setOpen(false)));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Actions"
      >
        <MoreVertical size={16} className="text-[var(--text-secondary)]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-52 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-medium)] shadow-2xl z-40 py-1 overflow-hidden">
            <button
              onClick={() => setModal('warn')}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2.5"
            >
              <AlertTriangle size={14} className="text-[var(--gold)]" />
              Avertir
            </button>
            {isMuted ? (
              <button
                onClick={handleUnmute}
                disabled={isPending}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2.5"
              >
                <Volume2 size={14} className="text-[var(--breath)]" />
                Réactiver la parole
              </button>
            ) : (
              <button
                onClick={() => setModal('mute')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2.5"
              >
                <VolumeX size={14} className="text-[var(--douceur)]" />
                Mettre en muet
              </button>
            )}
            {isBanned ? (
              <button
                onClick={handleUnban}
                disabled={isPending}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2.5 text-[var(--breath)]"
              >
                <ShieldOff size={14} />
                Débannir
              </button>
            ) : (
              <button
                onClick={() => setModal('ban')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2.5 text-[var(--coral)]"
              >
                <Ban size={14} />
                Bannir
              </button>
            )}
          </div>
        </>
      )}

      {/* Modal de raison */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-medium)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1 capitalize">
              {modal === 'warn' && 'Avertir cet utilisateur'}
              {modal === 'mute' && 'Mettre en muet'}
              {modal === 'ban' && 'Bannir cet utilisateur'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">L'action est loggée et notifiée à l'utilisateur.</p>

            {(modal === 'mute' || modal === 'ban') && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-[var(--serenity)] uppercase tracking-wider mb-2">Durée</label>
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-[var(--border-medium)] text-white"
                >
                  <option value={1}>1 heure</option>
                  <option value={24}>24 heures</option>
                  <option value={72}>3 jours</option>
                  <option value={168}>7 jours</option>
                  <option value={720}>30 jours</option>
                  {modal === 'ban' && <option value={0}>Définitif</option>}
                </select>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-xs font-bold text-[var(--serenity)] uppercase tracking-wider mb-2">Raison</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: propos haineux dans le salon TAG"
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-[var(--border-medium)] text-white text-sm placeholder-white/30 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={submit}
                disabled={!reason || isPending}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--coral)] hover:bg-[var(--coral)]/80 text-white text-sm font-bold disabled:opacity-50"
              >
                {isPending ? '…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
