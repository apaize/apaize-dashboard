// ============================================================
// 📐 Layout des pages authentifiées (sidebar + topbar + content)
// Le middleware gère le gating admin avant d'arriver ici.
// ============================================================
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
