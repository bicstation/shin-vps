"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Users, Search, UserMinus, ShieldCheck, Mail, Calendar, Filter, Settings 
} from 'lucide-react';

// ユーザーデータの型定義
interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
}

/**
 * 💡 実際のUIとロジックを担うメインコンテンツ
 */
function UserManagementContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔄 ユーザー一覧の取得 (Django API接続への準備)
  useEffect(() => {
    const fetchUsers = async () => {
      // 開発用の仮データ。API実装後に fetch に差し替え
      const dummyUsers: User[] = [
        { id: 1, username: "maya_admin", email: "maya@bicstation.com", is_staff: true, date_joined: "2024-01-01", last_login: "2024-05-20" },
        { id: 2, username: "kenji_dev", email: "kenji@example.jp", is_staff: false, date_joined: "2024-02-15", last_login: "2024-05-18" },
        { id: 3, username: "shina_user", email: "shina@test.com", is_staff: false, date_joined: "2024-03-10", last_login: null },
      ];
      
      // ローディング体感を出すための擬似遅延
      setTimeout(() => {
        setUsers(dummyUsers);
        setLoading(false);
      }, 500);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* 🚀 ヘッダーエリア */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
            User Management <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">Admin Only</span>
          </h1>
          <p className="text-slate-400 mt-1 font-medium">登録ユーザーの権限管理およびアクセス監視</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Users size={14} /> Total Users: <span className="text-white">{users.length}</span>
        </div>
      </div>

      {/* 🛠️ 操作ツールバー */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by username or email..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-cyan-500 transition-all text-sm text-slate-200 placeholder:text-slate-600 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold border border-slate-700 text-slate-300 transition-all active:scale-95">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* 📊 ユーザーテーブル */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-800/30 border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">User Info</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Joined Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Last Activity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right whitespace-nowrap">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600/80 to-blue-700/80 flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">{user.username}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono tracking-tighter">
                          <Mail size={12} className="text-slate-600" /> {user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_staff ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                        <ShieldCheck size={12} /> ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-slate-800 text-slate-500 border border-slate-700">
                        MEMBER
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-400 font-mono">
                    <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-600" /> {user.date_joined}</div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-400 font-mono">
                    {user.last_login ? (
                      <span className="text-emerald-500/80">{user.last_login}</span>
                    ) : (
                      <span className="text-slate-700">NEVER LOGIN</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors" title="Edit Permissions">
                        <Settings size={18} />
                      </button>
                      <button className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-500 transition-colors" title="Delete User">
                        <UserMinus size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 検索結果ゼロの場合 */}
        {!loading && filteredUsers.length === 0 && (
          <div className="p-24 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 text-slate-600 mb-4">
              <Search size={32} />
            </div>
            <p className="text-slate-500 font-bold tracking-tight">一致するユーザーが見つかりません</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-4 text-cyan-500 text-xs font-black uppercase hover:underline"
            >
              検索条件をクリア
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * ✅ ページエントリポイント
 * ビルド時の CSR bailout エラーを回避するために Suspense でラップ
 */
export default function UserManagement() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-mono text-xs animate-pulse">INITIALIZING USER CONSOLE...</p>
      </div>
    }>
      <UserManagementContent />
    </Suspense>
  );
}