// frontend/src/app/admin/layout.tsx
import { LayoutDashboard, Package, Users, Settings, LogOut, Terminal } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* サイドバー */}
      <aside className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col p-6 sticky top-0">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
          <span className="text-xl font-black tracking-tighter italic">BICSTATION</span>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <NavItem href="/admin/products" icon={<Package size={20}/>} label="Product Manager" />
          <NavItem href="/admin/users" icon={<Users size={20}/>} label="User Control" />
          <NavItem href="/admin/scrapers" icon={<Terminal size={20}/>} label="Scraper Logs" />
          <NavItem href="/admin/settings" icon={<Settings size={20}/>} label="Settings" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button className="flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors px-2">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 bg-slate-950">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: any) {
  return (
    <a href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
             : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
    }`}>
      {icon}
      <span className="font-semibold">{label}</span>
    </a>
  );
}