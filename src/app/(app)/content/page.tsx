// ============================================================
// 📚 Contenu — themes / banned_words / spark_templates
// ============================================================
import { FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab ?? 'themes';

  const supabase = await createClient();

  const [themes, words, sparks] = await Promise.all([
    supabase.from('themes').select('*').order('display_order'),
    supabase.from('banned_words').select('*').order('severity').limit(500),
    supabase.from('spark_templates').select('*').order('display_order'),
  ]);

  const TABS = [
    { key: 'themes', label: `Thèmes (${themes.data?.length ?? 0})` },
    { key: 'banned_words', label: `Mots bannis (${words.data?.length ?? 0})` },
    { key: 'sparks', label: `Sparks (${sparks.data?.length ?? 0})` },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FileText className="text-[var(--douceur)]" size={28} />
          Contenu
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Thèmes d'anxiété, mots bannis, templates de sparks
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-soft)]">
        {TABS.map((t) => (
          <a
            key={t.key}
            href={`?tab=${t.key}`}
            className="px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors"
            style={{
              borderColor: tab === t.key ? 'var(--serenity)' : 'transparent',
              color: tab === t.key ? 'var(--serenity)' : 'var(--text-secondary)',
            }}
          >
            {t.label}
          </a>
        ))}
      </div>

      {tab === 'themes' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.data?.map((t: any) => (
            <div key={t.id} className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${t.color ?? '#6ca8ff'}20`, border: `1px solid ${t.color ?? '#6ca8ff'}40` }}>
                  {t.icon ?? '🌀'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono">{t.slug}</div>
                </div>
                {!t.is_published && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] font-bold uppercase">Brouillon</span>
                )}
              </div>
              {t.short_description && (
                <p className="text-xs text-[var(--text-secondary)] line-clamp-3">{t.short_description}</p>
              )}
              {t.reading_time && (
                <div className="text-[10px] text-[var(--text-muted)] mt-2">⏱ {t.reading_time} min de lecture</div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'banned_words' && (
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-[var(--text-muted)] uppercase tracking-wider bg-white/5">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Mot</th>
                <th className="text-left px-4 py-3 font-semibold">Sévérité</th>
                <th className="text-left px-4 py-3 font-semibold">Catégorie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {words.data?.map((w: any) => (
                <tr key={w.id} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 font-mono text-white">{w.word}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                      style={{
                        background: w.severity === 'crisis' ? 'rgba(240,133,133,0.20)' : w.severity === 'block' ? 'rgba(255,213,142,0.20)' : 'rgba(141,167,255,0.20)',
                        color: w.severity === 'crisis' ? '#f08585' : w.severity === 'block' ? '#ffd58e' : '#8da7ff',
                      }}
                    >
                      {w.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{w.category ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'sparks' && (
        <div className="grid md:grid-cols-2 gap-4">
          {sparks.data?.map((s: any) => (
            <div key={s.key} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{s.emoji}</div>
                <div className="flex-1">
                  <div className="text-sm text-white">{s.text}</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">{s.key}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
