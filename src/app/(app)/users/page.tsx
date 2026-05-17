// ============================================================
// 👥 Users — liste paginée + actions de modération
// ============================================================
import Link from 'next/link';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { UserActionsMenu } from './user-actions-menu';
import { formatDate, timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const page = Math.max(1, parseInt(sp.page ?? '1', 10));
  const filter = sp.filter ?? 'all';

  const supabase = await createClient();

  let query = supabase
    .from('profiles')
    .select(
      'id, username, email, created_at, is_admin, muted_until, banned_until, ban_reason, warnings_count, anonymous_mode, avatar_url',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (q) {
    query = query.or(`username.ilike.%${q}%,email.ilike.%${q}%`);
  }
  if (filter === 'banned') query = query.not('banned_until', 'is', null);
  if (filter === 'muted') query = query.not('muted_until', 'is', null);
  if (filter === 'admins') query = query.eq('is_admin', true);
  if (filter === 'warned') query = query.gt('warnings_count', 0);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: users, count } = await query;

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {count?.toLocaleString('fr-FR') ?? 0} comptes au total
          </p>
        </div>

        {/* Search + filters */}
        <form className="flex flex-wrap gap-2 items-center" action="" method="get">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Pseudo ou email…"
              className="pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] text-sm w-64 focus:outline-none focus:border-[var(--serenity)]"
            />
          </div>
          <select
            name="filter"
            defaultValue={filter}
            className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] text-sm focus:outline-none focus:border-[var(--serenity)]"
          >
            <option value="all">Tous</option>
            <option value="banned">Bannis</option>
            <option value="muted">En muet</option>
            <option value="warned">Avertis</option>
            <option value="admins">Admins</option>
          </select>
          <button type="submit" className="px-4 py-2 rounded-lg bg-[var(--serenity)] hover:bg-[var(--serenity-dark)] text-white text-sm font-semibold">
            Filtrer
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-[var(--text-muted)] uppercase tracking-wider bg-white/5">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Utilisateur</th>
              <th className="text-left px-4 py-3 font-semibold">Email</th>
              <th className="text-left px-4 py-3 font-semibold">Statut</th>
              <th className="text-left px-4 py-3 font-semibold">Inscription</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)]">
            {users && users.length > 0 ? (
              users.map((u: any) => {
                const isBanned = u.banned_until && new Date(u.banned_until) > new Date();
                const isMuted = u.muted_until && new Date(u.muted_until) > new Date();
                return (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/users/${u.id}`} className="flex items-center gap-2.5 hover:text-[var(--serenity)] group">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--serenity)] to-[var(--douceur)] flex items-center justify-center text-xs font-bold text-white">
                          {(u.username?.[0] || u.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-[var(--serenity)] flex items-center gap-1.5">
                            {u.username || <span className="text-[var(--text-muted)] italic">sans pseudo</span>}
                            {u.is_admin && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-bold uppercase">Admin</span>
                            )}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] font-mono">{u.id.slice(0, 8)}…</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {isBanned && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--coral)]/15 text-[var(--coral)] font-bold border border-[var(--coral)]/30">
                            Banni
                          </span>
                        )}
                        {isMuted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--douceur)]/15 text-[var(--douceur)] font-bold border border-[var(--douceur)]/30">
                            Muet
                          </span>
                        )}
                        {!isBanned && !isMuted && u.warnings_count > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] font-bold border border-[var(--gold)]/30">
                            ⚠ {u.warnings_count}
                          </span>
                        )}
                        {!isBanned && !isMuted && u.warnings_count === 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--breath)]/15 text-[var(--breath)] font-bold border border-[var(--breath)]/30">
                            OK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                      <div>{formatDate(u.created_at)}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{timeAgo(u.created_at)}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!u.is_admin && (
                        <UserActionsMenu
                          userId={u.id}
                          isMuted={!!isMuted}
                          isBanned={!!isBanned}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-muted)]">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-[var(--text-muted)]">
            Page {page} sur {totalPages}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`?q=${q}&filter=${filter}&page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] hover:border-[var(--serenity)] transition-colors"
              >
                ← Précédent
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?q=${q}&filter=${filter}&page=${page + 1}`}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] hover:border-[var(--serenity)] transition-colors"
              >
                Suivant →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
