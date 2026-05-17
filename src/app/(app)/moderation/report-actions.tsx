'use client';

import { useTransition } from 'react';
import { Check, X, EyeOff } from 'lucide-react';
import { resolveReport, hideMessage } from './actions';

export function ReportActions({
  reportId,
  messageId,
}: {
  reportId: string;
  messageId: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-1.5">
      {messageId && (
        <button
          onClick={() =>
            startTransition(() => hideMessage(messageId, 'Modéré par admin').then(() => resolveReport(reportId, 'resolved')))
          }
          disabled={isPending}
          className="px-2.5 py-1.5 rounded-lg bg-[var(--coral)]/15 hover:bg-[var(--coral)]/25 border border-[var(--coral)]/30 text-[var(--coral)] text-xs font-semibold flex items-center gap-1"
          title="Masquer le message + résoudre"
        >
          <EyeOff size={12} /> Masquer
        </button>
      )}
      <button
        onClick={() => startTransition(() => resolveReport(reportId, 'resolved'))}
        disabled={isPending}
        className="px-2.5 py-1.5 rounded-lg bg-[var(--breath)]/15 hover:bg-[var(--breath)]/25 border border-[var(--breath)]/30 text-[var(--breath)] text-xs font-semibold flex items-center gap-1"
        title="Marquer résolu"
      >
        <Check size={12} /> Résoudre
      </button>
      <button
        onClick={() => startTransition(() => resolveReport(reportId, 'dismissed'))}
        disabled={isPending}
        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--text-secondary)] text-xs font-semibold flex items-center gap-1"
        title="Rejeter"
      >
        <X size={12} /> Rejeter
      </button>
    </div>
  );
}
