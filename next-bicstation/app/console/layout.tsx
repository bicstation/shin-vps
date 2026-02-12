"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BrainCircuit, 
  Settings, 
  LogOut, 
  Activity,
  Package,
  Terminal
} from 'lucide-react';

/**
 * 💡 Next.js 15 のビルドエラー対策
 * このレイアウト配下を動的レンダリングとしてマークし、
 * useSearchParams 等の Bailout エラーを防止します。
 */
export const dynamic = "force-dynamic";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  /**
   * 🔗 パス判定ロジック
   */
  const isActive = (path: string) => {
    return pathname.endsWith(path) || pathname.includes(`${path}/`);
  };

  const menuItems = [
    { href: "/console/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { href: "/console/products", icon: <Package size={18} />, label: "Product Manager" },
    { href: "/console/users", icon: <Users size={18} />, label: "User Management" },
    { href: "/console/metadata", icon: <BrainCircuit size={18} />, label: "AI Meta Sync" },
    { href: "/console/scrapers", icon: <Terminal size={18} />, label: "Scraper Logs" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 font-sans">
      
      {/* 🚀 共通サイドバー */}
      <aside className="w-64 bg-[#0a0f1c] border-r border-slate-800/60 flex flex-col fixed h-full z-50 backdrop-blur-xl">
        
        {/* ロゴ・ヘッダーエリア */}
        <div className="p-8 border-b border-slate-800/40">
          <h2 className="text-xl font-black tracking-tighter text-cyan-400 flex items-center gap-2">
            <Activity size={22} className="text-cyan-500 animate-pulse" /> COMMAND
          </h2>
          <p className="text-[9px] text-slate-500 font-bold tracking-[0.3em] uppercase mt-1">
            System Administration
          </p>
        </div>

        {/* ナビゲーションメニュー */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <SidebarLink 
              key={item.href}
              href={item.href} 
              icon={item.icon} 
              label={item.label} 
              active={isActive(item.href)} 
            />
          ))}
          
          <div className="pt-6 pb-2 px-4">
            <div className="h-[1px] bg-slate-800/60 w-full" />
          </div>

          <SidebarLink 
            href="/console/settings" 
            icon={<Settings size={18} />} 
            label="System Config" 
            active={isActive('/console/settings')} 
          />
        </nav>

        {/* 下部アクションエリア */}
        <div className="p-6 border-t border-slate-800/60 bg-slate-900/20">
          <Link 
            href="/mypage" 
            className="flex items-center gap-3 text-slate-500 hover:text-rose-400 text-sm font-bold transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Exit to Mypage</span>
          </Link>
        </div>
      </aside>

      {/* 🚀 メインコンテンツエリア */}
      <main className="flex-1 ml-64 min-h-screen relative bg-[#020617]">
        {/* 背景装飾 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-5%] right-[10%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
        </div>
        
        {/* コンテンツ描画 */}
        <div className="p-8 lg:p-12 relative z-10 max-w-[1600px] mx-auto">
          {/* ✅ 重要：配下のページが useSearchParams を使っても大丈夫なように Suspense で囲む */}
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <div className="animate-spin h-10 w-10 border-4 border-cyan-500 rounded-full border-t-transparent"></div>
              <p className="text-slate-500 text-sm animate-pulse font-mono">INITIALIZING CONSOLE...</p>
            </div>
          }>
            {children}
          </Suspense>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

/**
 * サイドバーリンク用サブコンポーネント
 */
function SidebarLink({ href, icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
  return (
    <Link href={href} className={`
      flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group relative
      ${active 
        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]' 
        : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'}
    `}>
      <span className={`${active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-300'} transition-colors`}>
        {icon}
      </span>
      <span className="tracking-tight">{label}</span>
      
      {active && (
        <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      )}
    </Link>
  );
}