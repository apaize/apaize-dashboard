// ============================================================
// 📊 StatCard — carte KPI réutilisable pour le dashboard home
// ============================================================
import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  color?: 'serenity' | 'breath' | 'douceur' | 'gold' | 'coral' | 'hearts';
  href?: string;
};

const COLOR_MAP: Record<NonNullable<Props['color']>, { bg: string; text: string; border: string }> = {
  serenity: { bg: 'rgba(108,168,255,0.12)', text: '#6ca8ff', border: 'rgba(108,168,255,0.35)' },
  breath: { bg: 'rgba(94,205,186,0.12)', text: '#5ecdba', border: 'rgba(94,205,186,0.35)' },
  douceur: { bg: 'rgba(141,167,255,0.12)', text: '#8da7ff', border: 'rgba(141,167,255,0.35)' },
  gold: { bg: 'rgba(255,213,142,0.12)', text: '#ffd58e', border: 'rgba(255,213,142,0.35)' },
  coral: { bg: 'rgba(240,133,133,0.12)', text: '#f08585', border: 'rgba(240,133,133,0.35)' },
  hearts: { bg: 'rgba(245,164,196,0.12)', text: '#f5a4c4', border: 'rgba(245,164,196,0.35)' },
};

export function StatCard({ label, value, hint, icon: Icon, color = 'serenity', href }: Props) {
  const colors = COLOR_MAP[color];

  const inner = (
    <div className="relative h-full p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-soft)] hover:border-[var(--border-medium)] transition-all group overflow-hidden">
      {/* Glow décoratif */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-50 blur-2xl pointer-events-none"
        style={{ background: colors.bg }}
      />

      <div className="relative flex items-start justify-between mb-3">
        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </div>
        {Icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border"
            style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="relative flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
      </div>

      {hint && <div className="relative text-xs text-[var(--text-muted)]">{hint}</div>}

      {href && (
        <div className="relative mt-3 flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.text }}>
          Voir détails <ArrowUpRight size={12} />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}
