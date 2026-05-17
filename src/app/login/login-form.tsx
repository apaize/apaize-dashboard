'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Le middleware vérifiera is_admin et redirigera proprement
    router.refresh();
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-[var(--coral)]/15 border border-[var(--coral)]/40 text-sm text-[var(--coral)]">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-[var(--serenity)] uppercase tracking-wider mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@apaize.fr"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[var(--border-medium)] text-white placeholder-white/30 focus:outline-none focus:border-[var(--serenity)] transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--serenity)] uppercase tracking-wider mb-2">
          Mot de passe
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[var(--border-medium)] text-white placeholder-white/30 focus:outline-none focus:border-[var(--serenity)] transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6ca8ff] to-[#8da7ff] text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-[#6ca8ff]/30 disabled:opacity-50"
      >
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
