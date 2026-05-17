// ============================================================
// 📐 Layout des pages authentifiées (sidebar + topbar + content)
// Le middleware a déjà vérifié qu'on est authentifié.
// Ici on vérifie qu'on est admin, sinon on signout + redirect /login.
// ============================================================
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    // Pas admin → signout + redirect
    await supabase.auth.signOut();
    redirect('/login?error=not_admin');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
