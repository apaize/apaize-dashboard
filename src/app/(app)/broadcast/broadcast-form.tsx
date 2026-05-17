'use client';

import { useState, useTransition } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { broadcastNotification, type BroadcastSegment } from './actions';

export function BroadcastForm({ groups }: { groups: { id: string; theme_slug: string; number: number }[] }) {
  const [segment, setSegment] = useState<BroadcastSegment>('all');
  const [groupId, setGroupId] = useState<string>('');
  const [type, setType] = useState<'system' | 'warning'>('system');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ sent: number; error: string | null } | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    start(async () => {
      const r = await broadcastNotification({
        segment,
        groupId: segment === 'group' ? groupId : null,
        type,
        title,
        message,
      });
      setResult(r);
      if (r.sent > 0) {
        setTitle('');
        setMessage('');
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[var(--serenity)] uppercase tracking-wider mb-2">
            Cible
          </label>
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value as BroadcastSegment)}
            className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] text-white text-sm"
          >
            <option value="all">Tous les utilisateurs (non bannis)</option>
            <option value="anges">Tous les Anges Apaize</option>
            <option value="group">Un salon spécifique</option>
            <option value="premium" disabled>
              Premium uniquement (à venir)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--serenity)] uppercase tracking-wider mb-2">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] text-white text-sm"
          >
            <option value="system">Information système</option>
            <option value="warning">Avertissement</option>
          </select>
        </div>
      </div>

      {segment === 'group' && (
        <div>
          <label className="block text-xs font-bold text-[var(--serenity)] uppercase tracking-wider mb-2">
            Salon
          </label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] text-white text-sm"
            required
          >
            <option value="">— choisir un salon —</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                #{g.theme_slug}-{g.number}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-[var(--serenity)] uppercase tracking-wider mb-2">
          Titre
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          required
          placeholder="Ex: Mise à jour importante"
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] text-white text-sm"
        />
        <div className="text-[10px] text-[var(--text-muted)] mt-1">{title.length}/80</div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--serenity)] uppercase tracking-wider mb-2">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={300}
          required
          rows={4}
          placeholder="Ex: Une nouvelle fonctionnalité..."
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] text-white text-sm resize-none"
        />
        <div className="text-[10px] text-[var(--text-muted)] mt-1">{message.length}/300</div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending || !title || !message || (segment === 'group' && !groupId)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--serenity)] to-[var(--douceur)] text-white font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send size={16} />
          {pending ? 'Envoi…' : 'Envoyer la notification'}
        </button>

        {result && (
          <div
            className={`flex items-center gap-2 text-sm font-semibold ${
              result.sent > 0 ? 'text-[var(--breath)]' : 'text-[var(--coral)]'
            }`}
          >
            {result.sent > 0 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {result.sent > 0 ? `✅ ${result.sent} notifications envoyées` : `❌ ${result.error}`}
          </div>
        )}
      </div>
    </form>
  );
}
