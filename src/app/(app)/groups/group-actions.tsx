'use client';

// ============================================================
// 🎛️ Boutons d'action UI pour /groups et /groups/[id]
// ============================================================
import { useState, useTransition } from 'react';
import { EyeOff, Eye, LockOpen, Lock, UserMinus } from 'lucide-react';
import { hideMessage, unhideMessage, setGroupOpen, kickMember } from './actions';

export function ToggleGroupOpen({
  groupId,
  isOpen,
}: {
  groupId: string;
  isOpen: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(() => setGroupOpen(groupId, !isOpen));
      }}
      disabled={pending}
      title={isOpen ? 'Fermer ce salon' : 'Rouvrir ce salon'}
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
        isOpen
          ? 'bg-[var(--coral)]/15 border-[var(--coral)]/40 text-[var(--coral)] hover:bg-[var(--coral)]/25'
          : 'bg-[var(--breath)]/15 border-[var(--breath)]/40 text-[var(--breath)] hover:bg-[var(--breath)]/25'
      }`}
    >
      {isOpen ? <Lock size={10} /> : <LockOpen size={10} />}
      {isOpen ? 'Fermer' : 'Rouvrir'}
    </button>
  );
}

export function HideMessageBtn({
  messageId,
  hidden,
}: {
  messageId: string;
  hidden: boolean;
}) {
  const [pending, start] = useTransition();
  return hidden ? (
    <button
      onClick={() => start(() => unhideMessage(messageId))}
      disabled={pending}
      title="Démasquer"
      className="text-[10px] px-2 py-1 rounded-lg bg-[var(--breath)]/15 hover:bg-[var(--breath)]/25 border border-[var(--breath)]/30 text-[var(--breath)] font-semibold flex items-center gap-1"
    >
      <Eye size={10} /> Démasquer
    </button>
  ) : (
    <button
      onClick={() => {
        const reason = window.prompt('Raison du masquage ?', 'Contenu inapproprié');
        if (reason) start(() => hideMessage(messageId, reason));
      }}
      disabled={pending}
      title="Masquer"
      className="text-[10px] px-2 py-1 rounded-lg bg-[var(--coral)]/15 hover:bg-[var(--coral)]/25 border border-[var(--coral)]/30 text-[var(--coral)] font-semibold flex items-center gap-1"
    >
      <EyeOff size={10} /> Masquer
    </button>
  );
}

export function KickMemberBtn({ groupId, userId }: { groupId: string; userId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => {
        const reason = window.prompt('Raison du retrait ?', 'Comportement inapproprié');
        if (reason) start(() => kickMember(groupId, userId, reason));
      }}
      disabled={pending}
      title="Retirer ce membre"
      className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-1.5 py-0.5 rounded bg-[var(--coral)]/15 hover:bg-[var(--coral)]/25 border border-[var(--coral)]/30 text-[var(--coral)] font-semibold flex items-center gap-1"
    >
      <UserMinus size={9} />
    </button>
  );
}
