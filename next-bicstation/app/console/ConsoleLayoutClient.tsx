"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, BrainCircuit, Settings,
  LogOut, Activity, Package, Terminal, FileText
} from 'lucide-react';

import { requireAuth } from '@shared/lib/utils/authGuard';

// ✅ これは必ず外
export const dynamic = "force-dynamic";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const user = await requireAuth();

      if (!user) {
        setLoading(false);
        return;
      }

      if (!user.is_staff) {
        router.push('/');
        return;
      }

      setLoading(false);
    };

    check();
  }, []);

  // 🔐 認証中
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-cyan-400 font-mono">
        AUTHORIZING ADMIN...
      </div>
    );
  }

  const isActive = (path: string) => {
    return pathname.endsWith(path) || pathname.includes(`${path}/`);
  };

  const menuItems = [
    { href: "/console/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { href: "/console/products", icon: <Package size={18} />, label: "Product Manager" },
    { href: "/console/contents", icon: <FileText size={18} />, label: "Content AI" },
    { href: "/console/users", icon: <Users size={18} />, label: "User Management" },
    { href: "/console/metadata", icon: <BrainCircuit size={18} />, label: "AI Meta Sync" },
    { href: "/console/scrapers", icon: <Terminal size={18} />, label: "Scraper Logs" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 font-sans">
      {/* サイドバー */}
      <aside className="w-64 bg-[#0a0f1c] border-r border-slate-800/60 flex flex-col fixed h-full z-50 backdrop-blur-xl">
        <div className="p-8 border-b border-slate-800/40">
          <h2 className="text-xl font-black tracking-tighter text-cyan-400 flex items-center gap-2">
            <Activity size={22} className="text-cyan-500 animate-pulse" /> COMMAND
          </h2>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1.5">
          {menuItems.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/60">
          <Link href="/mypage" className="flex items-center gap-3 text-slate-500 hover:text-rose-400 text-sm font-bold">
            <LogOut size={18} /> Exit
          </Link>
        </div>
      </aside>

      {/* メイン */}
      <main className="flex-1 ml-64 p-8">
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold
      ${active ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}>
      {icon}
      {label}
    </Link>
  );
}