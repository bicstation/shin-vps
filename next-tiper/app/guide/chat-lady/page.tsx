import React from 'react';

export default function ChatLadyRecruit() {
  // 司令官：ここにお手持ちの求人アフィリエイトリンク（ポケットチャット等）を流し込んでください
  const AFF_LINK = "【あなたの求人アフィリエイトリンク】";

  return (
    <div className="min-h-screen bg-[#fffafa] pb-20 font-sans">
      {/* Hero Section: 柔らかいピンクで安心感を演出 */}
      <div className="bg-[#fff0f3] border-b border-pink-100 py-16 px-4 text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-pink-700 leading-tight">
          「自分らしく、自由に稼ぐ」<br className="md:hidden" />在宅チャットレディという選択肢
        </h1>
        <p className="mt-4 text-gray-600">通勤なし・ノルマなし・顔出しなしでも月収50万を目指せます</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-pink-600 border-b-2 border-pink-200 pb-2 mb-8">
          チャットレディが選ばれる理由
        </h2>
        
        {/* Merit Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 hover:border-pink-200 transition-colors">
            <h4 className="font-bold text-pink-700 mb-2">✨ 高時給・即日払い</h4>
            <p className="text-sm text-gray-600 leading-relaxed">時給4,000円〜7,500円以上も可能。働いた分は24時間好きなタイミングで受け取れます。</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 hover:border-pink-200 transition-colors">
            <h4 className="font-bold text-pink-700 mb-2">✨ 完璧な身バレ対策</h4>
            <p className="text-sm text-gray-600 leading-relaxed">ハンドルネーム使用・特定地域ブロック機能完備。プライバシー保護を最優先します。</p>
          </div>
        </div>

        {/* Q&A Section */}
        <div className="bg-white p-8 rounded-xl border-l-8 border-pink-200 shadow-sm mb-12">
          <h3 className="font-bold text-gray-800 text-lg mb-3">Q. アダルトは必須ですか？</h3>
          <p className="text-gray-600 leading-relaxed">
            いいえ、<strong>「ノンアダルト（お喋り中心）」</strong>でも十分に稼げる環境が整っています。あなたのライフスタイルに合わせて自由に調整可能です。
          </p>
        </div>

        {/* Success Stories Section: 信頼性を高める「現役ライバーの声」 */}
        <div className="mb-16 bg-pink-50/30 p-8 rounded-3xl border border-pink-100">
          <h3 className="text-center text-pink-700 font-bold text-xl mb-8">現役ライバーさんの声</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start bg-white p-6 rounded-2xl shadow-sm">
              <div className="bg-pink-100 w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-pink-500 font-bold">A</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">「月5万の副収入のつもりが…」</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">20代・OL（副業）</p>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  最初は不安でしたが、スタッフさんが丁寧に教えてくれたので安心しました。今は週3日の夜だけで、本業を超える月もあります！
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start bg-white p-6 rounded-2xl shadow-sm">
              <div className="bg-pink-100 w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-pink-500 font-bold">B</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">「家事の合間に月20万」</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">30代・主婦（在宅）</p>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  子供が寝た後の数時間だけ働いています。通勤がないので家庭との両立が本当に楽。顔出しなしで稼げるのが嬉しいです。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Container */}
        <div className="text-center bg-white py-12 px-6 rounded-3xl shadow-lg border border-pink-100">
          <p className="font-bold text-pink-600 mb-6 text-lg">＼ 女性スタッフによる24時間サポート体制 ／</p>
          <a 
            href={AFF_LINK} 
            className="inline-block w-full md:w-80 bg-pink-500 hover:bg-pink-600 text-white font-bold py-6 px-8 rounded-xl text-xl transition-transform hover:scale-105 shadow-md"
          >
            無料エントリーして詳細を見る
          </a>
          <p className="text-xs text-gray-400 mt-6 font-light">※18歳以上の女性限定（高校生不可） / 完全無料登録</p>
        </div>
      </div>
    </div>
  );
}