import React from 'react';

// カード情報の定義（メンテナンス性を高めるため別定義に）
const CARDS = [
  {
    rank: 1,
    title: "三井住友カード（NL）",
    catch: "新NISA・コンビニ最強の旗艦",
    reward: "新規発行で 4,800円相当", // ASPの条件に合わせて調整
    features: ["コンビニ等で最大7%還元", "SBI証券でクレカ積立が可能", "年会費永年無料"],
    url: "YOUR_A8_LINK_HERE",
    color: "bg-green-700",
    label: "旗艦：投資・防衛",
  },
  {
    rank: 2,
    title: "楽天カード",
    catch: "楽天経済圏への必須補給艦",
    reward: "1,500円相当（楽天キャッシュ）",
    features: ["楽天市場でポイント3倍以上", "ふるさと納税に最適", "貯まったポイントで投資可能"],
    url: "YOUR_RAKUTEN_LINK_HERE",
    color: "bg-red-600",
    label: "補給：通販・納税",
  },
  {
    rank: 3,
    title: "イオンカード",
    catch: "実店舗・買い物防衛の要",
    reward: "特別プログラム実施中",
    features: ["イオングループで5%OFF優待", "WAONポイントがザクザク貯まる", "映画鑑賞1,000円特典（一部）"],
    url: "YOUR_AEON_LINK_HERE",
    color: "bg-purple-700",
    label: "防衛：スーパー・実生活",
  }
];

export default function CardGuidePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 bg-slate-50 min-h-screen">
      <header className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
          🚀 BIC-SAVING：人生を最適化する「三種の神器」
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto italic">
          「1円を笑う者は1億円に泣く」<br />
          決済を「ただの支払い」から「投資」へ昇華させるための最強布陣。
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {CARDS.map((card) => (
          <div key={card.rank} className="relative flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 transition-transform hover:-translate-y-2">
            {/* ラベル */}
            <div className={`${card.color} text-white text-xs font-bold px-3 py-1 absolute top-4 left-4 rounded-full uppercase`}>
              {card.label}
            </div>
            
            <div className="p-8 pt-12 text-center border-b border-slate-100">
              <div className="text-4xl font-black text-slate-200 mb-2">0{card.rank}</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{card.title}</h2>
              <p className="text-sm font-semibold text-blue-600 mb-4">{card.catch}</p>
            </div>

            <div className="p-8 flex-grow bg-slate-50/50">
              <ul className="space-y-3 mb-8">
                {card.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-slate-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="bg-white p-4 rounded-lg border border-dashed border-slate-300 text-center mb-6">
                <span className="text-xs text-slate-500 block mb-1">今なら！</span>
                <span className="text-lg font-bold text-red-600">{card.reward}</span>
              </div>
            </div>

            <div className="p-8 pt-0">
              <a 
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-4 rounded-xl font-bold text-white transition-opacity hover:opacity-90 ${card.color} shadow-lg shadow-inner`}
              >
                このカードで攻略を開始する
              </a>
              <p className="text-[10px] text-slate-400 mt-4 text-center italic">
                ※キャンペーン詳細はリンク先でご確認ください
              </p>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-20 text-center border-t border-slate-200 pt-10">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} <a href="https://bic-saving.com" className="hover:underline">BIC-SAVING FLEET</a>. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}