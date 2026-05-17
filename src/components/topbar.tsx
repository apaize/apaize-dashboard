// ============================================================
// 🔝 Topbar — user menu + actions globales
// (Server component qui lit le user, le logout est dans un Client child)
// ============================================================
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './logout-button';
import { GlobalSearch } from './global-search';

export async function Topbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { username: string | null; email: string | null; avatar_url: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, email, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    profile = data;
  }

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Admin';
  const initial = displayName[0]?.toUpperCase() || 'A';

  return (
    <header className="h-14 border-b border-[var(--border-soft)] bg-[var(--bg-primary)]/80 backdrop-blur-md flex items-center justify-between px-6 gap-4">
      <GlobalSearch />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--hearts)] to-[var(--douceur)] flex items-center justify-center text-sm font-bold text-white">
            {initial}
          </div>
          <div className="text-sm leading-tight">
            <div className="font-semibold text-white">{displayName}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{user?.email}</div>
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
