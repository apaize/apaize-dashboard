'use client';

// ============================================================
// 🧭 Sidebar — navigation principale de l'admin
// ============================================================
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  MessagesSquare,
  Hash,
  Sparkles,
  BarChart3,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: 'Pilotage',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'Communauté',
    items: [
      { href: '/users', label: 'Utilisateurs', icon: Users },
      { href: '/anges', label: 'Anges Apaize', icon: Sparkles },
      { href: '/groups', label: 'Salons', icon: Hash },
      { href: '/conversations', label: 'Sessions SOS', icon: MessagesSquare },
    ],
  },
  {
    section: 'Modération',
    items: [
      { href: '/moderation', label: 'Signalements', icon: ShieldAlert },
      { href: '/content', label: 'Contenu', icon: FileText },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-[var(--border-soft)] bg-[var(--bg-secondary)]/50 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--border-soft)]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--serenity)] to-[var(--douceur)] flex items-center justify-center text-lg shadow-lg shadow-[var(--serenity)]/30 group-hover:scale-105 transition-transform">
            🌿
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">Apaize</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Console</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {NAV.map((section) => (
          <div key={section.section}>
            <div className="px-3 mb-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              {section.section}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-[var(--serenity)]/15 text-[var(--serenity)] border border-[var(--serenity)]/30'
                          : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white border border-transparent'
                      )}
                    >
                      <Icon size={16} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--coral)]/20 text-[var(--coral)] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer (env tag) */}
      <div className="p-3 border-t border-[var(--border-soft)]">
        <div className="px-3 py-2 rounded-lg bg-white/5 text-[10px] text-[var(--text-muted)] flex items-center justify-between">
          <span>🌍 Production</span>
          <span className="text-[var(--breath)]">●</span>
        </div>
      </div>
    </aside>
  );
}
