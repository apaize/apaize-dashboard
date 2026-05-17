'use client';

// ============================================================
// 🔎 Global search — barre de recherche dans le topbar
// Pour l'instant : redirige vers /users avec q=… pour les users.
// On peut étendre vers messages/salons après si tu veux.
// ============================================================
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/users?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={submit} className="relative">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher un user…"
        className="pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-[var(--border-soft)] text-sm w-64 focus:outline-none focus:border-[var(--serenity)] placeholder-[var(--text-muted)]"
      />
    </form>
  );
}
