import React from 'react';

const BTO_MODELS = [
  {
    id: 'entry',
    rank: 'コスパ最強',
    title: "ビジネス・デイトレ特化モデル",
    target: "事務・株/FX・動画視聴",
    cpu: "Intel Core i5 / Ryzen 5",
    gpu: "内蔵グラフィックス（節約）",
    price: "79,800円〜",
    point: "グラボを削ってメモリに全振り。24時間稼働でも静かで低消費電力。",
    recommend_vendor: "ドスパラ（Magnateシリーズ）",
    color: "border-blue-500"
  },
  {
    id: 'standard',
    rank: '一番人気',
    title: "万能クリエイティブモデル",
    target: "動画編集・ミドル級ゲーム・AI学習",
    cpu: "Intel Core i7 / Ryzen 7",
    gpu: "RTX 4060 / 4060 Ti",
    price: "154,800円〜",
    point: "性能の「損益分岐点」がここ。これ以上は価格だけが跳ね上がる黄金比スペック。",
    recommend_vendor: "マウスコンピューター（NEXTGEAR）",
    color: "border-indigo-600"
  },
  {
    id: 'high',
    rank: 'プロ推奨',
    title: "4K・ハイエンド攻略モデル",
    target: "4K動画・最新ゲーム・3DCG",
    cpu: "Intel Core i9 / Ryzen 9",
    gpu: "RTX 4080 / 4090",
    price: "349,800円〜",
    point: "1円を笑う者が最後に辿り着く「妥協なし」のインフラ。資産価値も落ちにくい。",
    recommend_vendor: "パソコン工房（LEVEL∞）",
    color: "border-purple-600"
  }
];

export default function BtoGuidePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 bg-white">
      {/* ヒーローセクション */}
      <header className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">
          🖥️ BIC-STATION：BTOパソコン「絶対コスパ」選定ガイド
        </h1>
        <div className="inline-block bg-amber-100 text-amber-800 px-6 py-2 rounded-full text-sm font-bold mb-6">
          2026年4月度：最新ベンチマーク/市場価格反映済み
        </div>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          「最新＝正解」ではない。Bic Stationは、各パーツの価格推移と性能スコアを徹底分析。<br />
          あなたの用途において、**1円あたりの投資効率が最も高い1台**を提示します。
        </p>
      </header>

      {/* 診断セクション（ダミー） */}
      <section className="mb-20 p-8 bg-slate-900 rounded-3xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">💡 あなたに最適なスペックは？</h2>
            <p className="text-slate-400">予算と用途を選ぶだけで、DBから最適解を抽出します。</p>
          </div>
          <button className="mt-6 md:mt-0 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all">
            PC診断ツールを起動（準備中）
          </button>
        </div>
      </section>

      {/* メインカード */}
      <div className="grid lg:grid-cols-3 gap-8">
        {BTO_MODELS.map((model) => (
          <div key={model.id} className={`flex flex-col border-2 ${model.color} rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2`}>
            <div className="p-6 bg-white border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">{model.rank}</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{model.title}</h3>
            </div>
            
            <div className="p-6 bg-slate-50 flex-grow">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">主な用途</span>
                  <span className="font-bold text-slate-800 text-right">{model.target}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500">推奨CPU</span>
                  <span className="font-medium text-slate-800">{model.cpu}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500">推奨GPU</span>
                  <span className="font-medium text-slate-800">{model.gpu}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-blue-600 font-bold mb-1">Bic's Eye：</p>
                <p className="text-xs text-slate-700 leading-relaxed">{model.point}</p>
              </div>
            </div>

            <div className="p-6 bg-white text-center">
              <div className="mb-4">
                <span className="text-3xl font-black text-slate-900">{model.price}</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">推奨：{model.recommend_vendor}</p>
              <a 
                href="#" 
                className="block w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                構成をカスタマイズする
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* フッター誘導 */}
      <footer className="mt-20 text-center border-t border-slate-200 pt-12">
        <p className="text-slate-500 text-sm mb-4">
          ※表示価格は各メーカーのセール状況により変動します。
        </p>
        <div className="flex justify-center gap-6">
          <a href="/guide/parts" className="text-blue-600 font-bold hover:underline">← パーツ別コスパ比較はこちら</a>
          <a href="/guide/peripherals" className="text-blue-600 font-bold hover:underline">周辺機器の底値リストはこちら →</a>
        </div>
      </footer>
    </div>
  );
}