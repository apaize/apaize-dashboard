'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      title="Déconnexion"
      className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--coral)] transition-colors"
    >
      <LogOut size={16} />
    </button>
  );
}
