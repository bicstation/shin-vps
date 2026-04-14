import React from 'react';

const BROKERS = [
  {
    rank: 1,
    title: "SBI証券",
    catch: "新NISA・クレカ積立の絶対王者",
    reward: "三井住友カード積立でVポイント還元",
    features: ["売買手数料が完全無料（ゼロ革命）", "三井住友カード(NL)との連携が最強", "米国株・投信の銘柄数が圧倒的"],
    url: "YOUR_SBI_LINK_HERE",
    color: "bg-blue-800",
    label: "旗艦：資産形成",
  },
  {
    rank: 2,
    title: "楽天証券",
    catch: "ポイ活投資・UIの使いやすさNo.1",
    reward: "楽天カード決済でポイント還元",
    features: ["楽天ポイントで投資信託が買える", "日経新聞（日経テレコン）が無料で読める", "楽天銀行との連携（マネーブリッジ）で金利優遇"],
    url: "YOUR_RAKUTEN_SEC_LINK_HERE",
    color: "bg-red-700",
    label: "補給：楽天経済圏",
  },
  {
    rank: 3,
    title: "外為どっとコム",
    catch: "少額から始める「攻め」の外貨運用",
    reward: "ビック流・スワップ運用対応",
    features: ["100通貨などの少額から取引可能", "高スワップで外貨預金代わりの運用に最適", "SS Affiliate経由の高還元案件"],
    url: "YOUR_FX_LINK_HERE",
    color: "bg-amber-600",
    label: "加速：外貨戦略",
  }
];

export default function BrokerGuidePage() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-12 bg-slate-50 min-h-screen font-sans">
        <header className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            📈 BIC-SAVING：資産を加速させる「三種の口座」
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            節約で浮かせた「種銭」を爆発させる出口戦略。<br />
            カードと連携し、1円の無駄もなく複利の波に乗るための選定です。
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {BROKERS.map((broker) => (
            <div key={broker.rank} className="relative flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 transition-all hover:shadow-2xl">
              <div className={`${broker.color} text-white text-xs font-bold px-3 py-1 absolute top-4 left-4 rounded-full`}>
                {broker.label}
              </div>
              
              <div className="p-8 pt-12 text-center border-b border-slate-100">
                <div className="text-4xl font-black text-slate-100 mb-2">0{broker.rank}</div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{broker.title}</h2>
                <p className="text-sm font-semibold text-blue-600 mb-4">{broker.catch}</p>
              </div>

              <div className="p-8 flex-grow bg-slate-50/50">
                <ul className="space-y-3 mb-8">
                  {broker.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-slate-700">
                      <span className="text-blue-500 mr-2">▶</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="bg-white p-4 rounded-lg border border-indigo-100 text-center">
                  <span className="text-xs text-slate-500 block mb-1">ビック推奨シナジー</span>
                  <span className="text-sm font-bold text-indigo-700">{broker.reward}</span>
                </div>
              </div>

              <div className="p-8 pt-0">
                <a 
                  href={broker.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center py-4 rounded-xl font-bold text-white transition-transform active:scale-95 ${broker.color}`}
                >
                  口座開設（無料）で攻略開始
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="/guide/card" className="text-blue-600 hover:underline font-bold">
            ← セットで揃えたい「最強カード3選」はこちら
          </a>
        </div>
      </div>

      {/* 修正された広告エリア（フラグメント内に統合） */}
      <div className="flex flex-col items-center py-10 bg-white border-t border-slate-200">
        <a href="https://px.a8.net/svt/ejp?a8mat=2HQEUT+FW7LNM+1WP2+6G4HD" rel="nofollow">
          <img 
            style={{ border: 0 }} 
            width="250" 
            height="250" 
            alt="広告バナー" 
            src="https://www26.a8.net/svt/bgt?aid=150718133961&wid=095&eno=01&mid=s00000008903001083000&mc=1" 
          />
        </a>
        <img 
          style={{ border: 0 }} 
          width="1" 
          height="1" 
          src="https://www14.a8.net/0.gif?a8mat=2HQEUT+FW7LNM+1WP2+6G4HD" 
          alt="" 
        />
      </div>
    </>
  );
}