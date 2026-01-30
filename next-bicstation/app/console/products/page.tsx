"use client";

import React, { useState } from 'react';
import { 
  Search, Filter, Edit, Trash2, ExternalLink, 
  CheckCircle, Clock, AlertCircle, Plus, ChevronRight, X, Save, AlertTriangle
} from 'lucide-react';

const initialProducts = [
  { id: '1', name: '高性能ゲーミングPC Z-1 Black Edition', category: 'PC', status: 'active', price: '248,000', description: '第14世代Core i9搭載のフラッグシップモデル。' },
  { id: '2', name: 'VRヘッドセット Neo-V (High-End)', category: 'Gadget', status: 'pending', price: '68,000', description: '広視野角と高リフレッシュレートを実現した次世代VR。' },
  { id: '3', name: 'AIアシスタント搭載メカニカルキーボード', category: 'PC', status: 'error', price: '32,000', description: 'ChatGPTと連携する専用マクロキーを搭載。' },
];

export default function ProductManager() {
  const [products, setProducts] = useState(initialProducts);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 削除用ステート
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // 編集開始
  const handleEdit = (product: any) => {
    setSelectedProduct({ ...product });
    setIsEditModalOpen(true);
  };

  // 削除確認開始
  const handleConfirmDelete = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  // 削除実行
  const executeDelete = () => {
    setProducts(products.filter(p => p.id !== selectedProduct.id));
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
  };

  // 編集保存
  const handleSave = () => {
    setProducts(products.map(p => p.id === selectedProduct.id ? selectedProduct : p));
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      
      {/* 🚀 ヘッダーエリア */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-cyan-500 mb-2 font-black text-[10px] tracking-widest uppercase bg-cyan-500/10 w-fit px-2 py-0.5 rounded">
            Inventory <ChevronRight size={10} /> Management
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Product Manager</h1>
        </div>
        <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] text-xs text-white uppercase">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* 📋 データテーブル */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-950/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800/60">
              <th className="px-8 py-6">Product Information</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-cyan-500/[0.02] transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{p.name}</span>
                    <span className="text-[10px] text-slate-600 font-mono mt-1 font-bold">#PROD-{p.id.padStart(4, '0')}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(p)}
                      className="p-2.5 rounded-xl bg-slate-800/50 text-slate-500 border border-slate-700/50 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleConfirmDelete(p)}
                      className="p-2.5 rounded-xl bg-slate-800/50 text-slate-500 border border-slate-700/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🛠️ 詳細編集モーダル (前回分) */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Edit Product</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase">Product Name</label>
                <input type="text" value={selectedProduct.name} onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:border-cyan-500/50 outline-none" />
              </div>
              {/* ...他のフィールドは省略可能ですが、構造は維持... */}
            </div>
            <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Cancel</button>
              <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 px-8 py-3 rounded-xl text-xs font-bold text-white uppercase tracking-widest"><Save size={16} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ 削除確認ダイアログ (今回の追加分) */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-rose-950/20 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(225,29,72,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-rose-500 animate-pulse" />
              </div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Delete Product?</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                <span className="text-rose-400 font-bold">"{selectedProduct.name}"</span> を削除しようとしています。<br />
                この操作は取り消せません。本当によろしいですか？
              </p>
            </div>

            <div className="p-6 bg-slate-950/50 flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 rounded-2xl text-xs font-black text-slate-400 hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] uppercase tracking-widest"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ステータスバッジ (省略)
function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    active: { icon: <CheckCircle size={12} />, text: 'Active', classes: 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20' },
    pending: { icon: <Clock size={12} />, text: 'Pending', classes: 'text-amber-400 bg-amber-400/5 border-amber-400/20' },
    error: { icon: <AlertCircle size={12} />, text: 'Error', classes: 'text-rose-400 bg-rose-400/5 border-rose-400/20' },
  };
  const s = styles[status] || styles.pending;
  return (
    <div className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${s.classes}`}>
      {s.icon} {s.text}
    </div>
  );
}