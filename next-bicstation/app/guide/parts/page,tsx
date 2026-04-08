import React from 'react';

const SIMS = [
  {
    rank: 1,
    title: "楽天モバイル",
    catch: "データ無制限・楽天ポイント還元の要",
    reward: "楽天カード会員ならさらにポイント増量",
    features: ["データ使い放題で最大3,278円(税込)", "専用アプリで国内通話が無料", "楽天市場のポイント還元率が＋4倍"],
    url: "YOUR_RAKUTEN_MOBILE_LINK",
    color: "bg-pink-600",
    label: "旗艦：固定費破壊",
  },
  {
    rank: 2,
    title: "ahamo / povo / LINEMO",
    catch: "安定のキャリア品質・サブブランド",
    reward: "三井住友カード(NL)での支払い推奨",
    features: ["20GBの大容量＋安定した高品質回線", "事務手数料・違約金が完全無料", "基本料0円やLINEギガフリーなど選べる個性"],
    url: "YOUR_CARRIER_LINK",
    color: "bg-slate-800",
    label: "防衛：通信インフラ",
  },
  {
    rank: 3,
    title: "格安SIM（IIJmio / mineo等）",
    catch: "1円に拘るMNPスペシャリストの結論",
    reward: "浮いた5,000円をFX・NISAへ",
    features: ["月額数百円からの極限運用が可能", "端末セット1円〜等のMNPキャンペーンが強力", "余ったデータを翌月繰り越し・家族シェア"],
    url: "YOUR_MVNO_LINK",
    color: "bg-green-600",
    label: "加速：究極の節約",
  }
];

export default function SimGuidePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 bg-slate-50 min-h-screen">
      <header className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
          📱 BIC-SAVING：家計を救う「三種の通信戦略」
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          「通信費の1円は、将来の1万円」<br />
          MNP（乗り換え）を駆使し、固定費を「投資の種銭」に変換するロードマップ。
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {SIMS.map((sim) => (
          <div key={sim.rank} className="relative flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all hover:scale-[1.02]">
            <div className={`${sim.color} text-white text-xs font-bold px-3 py-1 absolute top-4 left-4 rounded-full uppercase`}>
              {sim.label}
            </div>
            
            <div className="p-8 pt-12 text-center border-b border-slate-100">
              <div className="text-4xl font-black text-slate-200 mb-2">0{sim.rank}</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{sim.title}</h2>
              <p className="text-sm font-semibold text-blue-600 mb-4">{sim.catch}</p>
            </div>

            <div className="p-8 flex-grow bg-slate-50/50">
              <ul className="space-y-3 mb-8">
                {sim.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-slate-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="bg-white p-4 rounded-lg border border-dashed border-slate-300 text-center">
                <span className="text-xs text-slate-500 block mb-1">MNPスペシャリストの目線</span>
                <span className="text-sm font-bold text-slate-800">{sim.reward}</span>
              </div>
            </div>

            <div className="p-8 pt-0">
              <a 
                href={sim.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-4 rounded-xl font-bold text-white shadow-lg ${sim.color}`}
              >
                MNP攻略・詳細を確認
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-4 text-center">
        <a href="/guide/card" className="p-4 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 text-blue-600 font-bold">
          💳 カードを整えて支払い効率を上げる
        </a>
        <a href="/guide/broker" className="p-4 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 text-indigo-600 font-bold">
          📈 浮いた通信費で資産運用を始める
        </a>
      </div>
    </div>
  );
}