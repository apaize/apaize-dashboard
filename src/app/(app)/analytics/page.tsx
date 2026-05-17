// ============================================================
// 📈 Analytics — agrégats simples (30j)
// ============================================================
import { BarChart3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { LineChart } from '@/components/line-chart';

export const dynamic = 'force-dynamic';

function buildDailySeries(rows: any[], days = 30): { date: string; value: number }[] {
  const byDay = new Map<string, number>();
  rows.forEach((r) => {
    const d = new Date(r.created_at);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  });
  // Fill missing days with 0
  const out: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    out.push({
      date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      value: byDay.get(key) ?? 0,
    });
  }
  return out;
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const sinceISO = new Date(Date.now() - 30 * 86400000).toISOString();

  const [signupsRes, moodsRes, sleepRes, sosRes, sessionsRes] = await Promise.all([
    supabase.from('profiles').select('created_at').gte('created_at', sinceISO),
    supabase.from('mood_entries').select('created_at').gte('created_at', sinceISO),
    supabase.from('sleep_entries').select('created_at').gte('created_at', sinceISO),
    supabase.from('sos_sessions').select('created_at:started_at').gte('started_at', sinceISO),
    supabase.from('angel_sessions').select('created_at').gte('created_at', sinceISO),
  ]);

  const charts = [
    { label: 'Inscriptions', data: buildDailySeries(signupsRes.data ?? []), color: '#6ca8ff' },
    { label: 'Check-ins humeur', data: buildDailySeries(moodsRes.data ?? []), color: '#5ecdba' },
    { label: 'Nuits enregistrées', data: buildDailySeries(sleepRes.data ?? []), color: '#8da7ff' },
    { label: 'Sessions SOS', data: buildDailySeries(sosRes.data ?? []), color: '#ffd58e' },
    { label: 'Sessions Anges', data: buildDailySeries(sessionsRes.data ?? []), color: '#f5a4c4' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="text-[var(--breath)]" size={28} />
          Analytics
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Activité des 30 derniers jours
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {charts.map((c) => {
          const total = c.data.reduce((sum, d) => sum + d.value, 0);
          const avg = (total / c.data.length).toFixed(1);
          return (
            <div key={c.label} className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)]">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-white">{c.label}</div>
                  <div className="text-xs text-[var(--text-muted)]">moy/jour {avg}</div>
                </div>
                <div className="text-2xl font-bold" style={{ color: c.color }}>
                  {total}
                </div>
              </div>
              <LineChart data={c.data} color={c.color} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
