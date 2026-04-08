import React from 'react';

const PERIPHERAL_GROUPS = [
  {
    category: "Monitor",
    title: "視覚インフラ：解像度と作業効率",
    description: "モニターは1枚増えるごとに生産性が40%向上します。4Kか、ウルトラワイドか。DBの価格推移を見て、今最も「買い」の1枚を特定。",
    items: [
      { name: "27インチ 4K IPSモニター", label: "デスクワークの終着点" },
      { name: "34インチ ウルトラワイド", label: "デイトレ・動画編集の神器" }
    ],
    strategy: "Amazonプライムデー等の大型セールで「型落ち」を狙うのが最安。",
    color: "border-l-cyan-500"
  },
  {
    category: "Input",
    title: "入力デバイス：腱鞘炎防止と打鍵感",
    description: "キーボードとマウスはPCとの対話。ここは「安物買いの銭失い」が最も発生しやすい場所です。",
    items: [
      { name: "静電容量無接点方式キーボード", label: "一生モノの投資" },
      { name: "高機能エルゴノミクスマウス", label: "ショートカットの鬼" }
    ],
    strategy: "楽天お買い物マラソンでポイント還元率を最大化して実質価格を下げる。",
    color: "border-l-rose-500"
  },
  {
    category: "Connectivity",
    title: "接続・インフラ：1円まで削る領域",
    description: "HDMIケーブルやUSBハブ。性能差が出にくい部分は、ノーブランド品の底値をDBで突き止めます。",
    items: [
      { name: "USB-C ドッキングステーション", label: "配線1本の快適さ" },
      { name: "GaN採用 急速充電器", label: "電源周りの小型化" }
    ],
    strategy: "AliExpressやAmazon定期便、100均のガジェットコーナーを併用。",
    color: "border-l-slate-400"
  }
];

export default function PeripheralsGuidePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 bg-white min-h-screen font-sans">
      <header className="mb-16 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          🖱️ PERIPHERALS：周辺機器・底値買い出しリスト
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          「良い道具は、時間を生み出す投資である」<br />
          デバイスごとの重要度を見極め、**投資すべきもの**と**削るべきもの**を明確にします。
        </p>
      </header>

      {/* 戦略セクション */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {PERIPHERAL_GROUPS.map((group, idx) => (
          <div key={idx} className={`bg-slate-50 p-8 rounded-3xl border-l-8 ${group.color} shadow-sm transition-all hover:shadow-md`}>
            <div className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">{group.category}</div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{group.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{group.description}</p>
            
            <ul className="space-y-3 mb-8">
              {group.items.map((item, i) => (
                <li key={i} className="flex flex-col bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-blue-600 font-bold mb-1">{item.label}</span>
                  <span className="text-sm font-bold text-slate-800">{item.name}</span>
                </li>
              ))}
            </ul>

            <div className="bg-slate-900 text-white p-4 rounded-xl text-xs">
              <span className="text-amber-400 font-black block mb-1">BIC'S STRATEGY:</span>
              {group.strategy}
            </div>
          </div>
        ))}
      </div>

      {/* DB連携表示エリア（肉付け用ダミー） */}
      <section className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">📉 リアルタイム底値トラッカー</h2>
            <p className="text-slate-500 text-sm mt-1">Amazon / 楽天 / 価格.com のDBから「今」安くなっているものを抽出。</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full text-xs font-bold text-slate-400 border border-slate-200">
            最終更新: 2026/04/09 03:55
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-400 text-xs uppercase tracking-tighter font-black">
                <th className="py-4 px-2">Product Name</th>
                <th className="py-4 px-2 text-center">Market Price</th>
                <th className="py-4 px-2 text-center">Target Price</th>
                <th className="py-4 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-white transition-colors">
                <td className="py-4 px-2 font-bold text-slate-800 text-sm">Logicool MX Master 3S</td>
                <td className="py-4 px-2 text-center text-slate-500 text-sm italic">¥16,900</td>
                <td className="py-4 px-2 text-center font-black text-slate-900 text-sm">¥14,800</td>
                <td className="py-4 px-2 text-right"><span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-bold">買い時！</span></td>
              </tr>
              <tr className="hover:bg-white transition-colors">
                <td className="py-4 px-2 font-bold text-slate-800 text-sm">Dell U2723QE</td>
                <td className="py-4 px-2 text-center text-slate-500 text-sm italic">¥74,800</td>
                <td className="py-4 px-2 text-center font-black text-slate-900 text-sm">¥65,000</td>
                <td className="py-4 px-2 text-right"><span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold">待ち</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-16 text-center">
        <a href="/" className="inline-block border-2 border-slate-900 text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
          Bic Station トップへ戻る
        </a>
      </div>
    </div>
  );
}