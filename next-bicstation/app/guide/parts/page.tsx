import React from 'react';

const PART_CATEGORIES = [
  {
    category: "CPU",
    title: "演算性能のコスパ分岐点",
    description: "最新世代のi9はロマン。実利なら1世代前のi5/i7が「1円あたりのスコア」で圧勝します。",
    best_buy: "Intel Core i5-13400 / Ryzen 5 7600",
    check_point: "マザーボードのソケット互換性をDBで要確認",
    color: "bg-blue-50"
  },
  {
    category: "GPU",
    title: "グラフィックの損益分岐点",
    description: "4Kにこだわらなければ、ミドルクラスが最も値崩れしにくく、ワットパフォーマンスも良好。",
    best_buy: "RTX 4060 Ti (16GB) / RX 7600 XT",
    check_point: "電源ユニットの容量不足は「安物買いの銭失い」の元",
    color: "bg-green-50"
  },
  {
    category: "SSD/RAM",
    title: "体感速度を支えるインフラ",
    description: "ここをケチると全てが台無し。Gen4 SSDへの換装は、最も安上がりな「PC再生術」です。",
    best_buy: "NVMe Gen4 2TB / DDR5-5600 32GB",
    check_point: "DRAMレスモデルは避けるのがビック流",
    color: "bg-amber-50"
  }
];

export default function PartsGuidePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 bg-slate-50 min-h-screen">
      <header className="mb-12 border-l-8 border-slate-900 pl-6">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          ⚙️ PARTS STRATEGY：PCパーツ選定・損益分岐点
        </h1>
        <p className="text-slate-600">
          「最安」は追わない。「最高効率」を追う。DBから導き出されたパーツ選定の結論。
        </p>
      </header>

      {/* パーツカテゴリ別・戦略カード */}
      <div className="space-y-8">
        {PART_CATEGORIES.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
            <div className={`md:w-1/4 p-8 flex flex-col justify-center items-center ${item.color}`}>
              <span className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-tighter">Category</span>
              <h2 className="text-3xl font-black text-slate-900">{item.category}</h2>
            </div>
            
            <div className="md:w-3/4 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                {item.description}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-4 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase">Bic's Best Buy</p>
                  <p className="text-lg font-bold">{item.best_buy}</p>
                </div>
                <div className="bg-amber-100 p-4 rounded-xl border border-amber-200">
                  <p className="text-[10px] text-amber-700 font-bold mb-1 uppercase">Check Point</p>
                  <p className="text-sm font-bold text-amber-900">{item.check_point}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center">
                  このカテゴリの価格比較DBを見る <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 換装シミュレーション（肉付け用） */}
      <section className="mt-16 p-8 bg-white rounded-3xl border-2 border-dashed border-slate-300">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">🛠 1万円でPCを蘇らせる「再生術」</h2>
          <p className="text-slate-500 mt-2 text-sm">買い換える前に、DBから最適なアップグレードパーツを探しましょう。</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-slate-50 rounded-2xl">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs">A</span>
              起動を爆速にする
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              HDDからSATA/NVMe SSDへの換装。数千円の投資で、古いPCが「現代のサブ機」として復活します。1円の価値が最も高まる瞬間です。
            </p>
            <a href="#" className="text-xs font-bold text-blue-600 hover:underline">推奨SSDリストを表示</a>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs">B</span>
              マルチタスクの渋滞解消
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              メモリを8GBから16GB/32GBへ。ブラウザのタブを大量に開く「Bic Saving」的リサーチには必須の増設です。
            </p>
            <a href="#" className="text-xs font-bold text-blue-600 hover:underline">互換メモリ診断を起動</a>
          </div>
        </div>
      </section>

      <footer className="mt-16 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400 border-t border-slate-200 pt-8">
        <p>© 2026 BIC-STATION PART STRATEGY</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="/guide/bto" className="hover:text-slate-900 transition-colors">BTOパソコン比較へ</a>
          <a href="/guide/peripherals" className="hover:text-slate-900 transition-colors">周辺機器ガイドへ</a>
        </div>
      </footer>
    </div>
  );
}