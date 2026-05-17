// ============================================================
// 🔐 LOGIN — page admin
// Email/password Supabase. Le middleware vérifie ensuite is_admin.
// ============================================================
import { LoginForm } from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const errorMsg =
    sp.error === 'not_admin'
      ? 'Ce compte n\'a pas les droits administrateur.'
      : sp.error === 'invalid'
      ? 'Identifiants invalides.'
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glows décoratifs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #8da7ff, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #5ecdba, transparent 70%)' }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6ca8ff] to-[#8da7ff] flex items-center justify-center text-2xl shadow-2xl shadow-[#6ca8ff]/30">
              🌿
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Apaize <span className="text-gradient-primary">Console</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Accès réservé aux administrateurs
          </p>
        </div>

        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-medium)] p-8 shadow-2xl">
          {errorMsg && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-[var(--coral)]/15 border border-[var(--coral)]/40 text-sm text-[var(--coral)]">
              {errorMsg}
            </div>
          )}
          <LoginForm />
        </div>

        <p className="text-xs text-center text-[var(--text-muted)] mt-6">
          🔒 Toutes les actions sont loggées dans <code className="text-[var(--serenity)]">moderation_actions</code>
        </p>
      </div>
    </div>
  );
}
