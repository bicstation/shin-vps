/* ExpertChatSection.tsx */
'use client'; // URLパラメータ（searchParams）を監視するためクライアントコンポーネント化

import React from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * 💡 ExpertChatSection (完全版)
 * AIによる多角的解析ログを、親しみやすいチャットUIで展開します。
 * * 機能:
 * 1. 空データ guard: 配列が空、または null の場合はセクションごと非表示。
 * 2. タイトル抽出: ログの1行目が短ければ、それを議論のテーマとして強調表示。
 * 3. 動的サイド: AIとユーザー、あるいはエージェント同士を左右交互に配置。
 * 4. デバッグモード: URLに ?debug=true がある時のみ、Rawデータを最下部に表示。
 */
export default function ExpertChatSection({ logs }) {
  const searchParams = useSearchParams();
  const isDebugMode = searchParams.get('debug') === 'true';

  // 🚨 鉄壁のガード: ログが存在しない、または空配列 [] の場合は何も表示しない
  if (!logs || !Array.isArray(logs) || logs.length === 0) {
    // ただし、デバッグモード時のみ「データがない」事実を表示（開発効率のため）
    return isDebugMode ? (
      <div className="p-4 bg-yellow-900/20 text-yellow-400 text-xs font-mono border border-yellow-500/50 rounded-lg my-12 animate-pulse">
        [DEBUG_INFO] ExpertChatSection: Received_logs_are_empty_or_null. Section_is_hidden_from_users.
      </div>
    ) : null;
  }

  // 📝 データの破壊を防ぐためコピーを作成
  const displayLogs = [...logs];
  
  // 💡 セッションタイトルの抽出ロジック
  // 配列の先頭要素が文字列かつ30文字以内なら、それをタイトルとして昇格させる
  let sessionTitle = "Expert_Insight_Logs";
  if (typeof displayLogs[0] === 'string' && displayLogs[0].length < 30) {
    sessionTitle = displayLogs.shift();
  }

  /**
   * 🔄 メッセージ描画関数
   * @param name キャラクター名
   * @param text 発言内容
   * @param index ループ用キー
   * @param side 左右どちらに置くか ('left' | 'right')
   */
  const renderMessage = (name, text, index, side = 'left') => {
    const isLeft = side === 'left';
    return (
      <div key={index} className={`flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-start gap-3 animate-fade-in mb-6`}>
        {/* キャラクターアイコン */}
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white shadow-lg bg-[#1a1a2e]">
            <img 
              src={isLeft ? "/src/images/expert_01.png" : "/src/images/expert_02.png"} 
              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-300"
              alt={name}
            />
          </div>
          {/* オンラインステータス風のドット装飾 */}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${isLeft ? 'bg-green-500' : 'bg-blue-400'}`}></div>
        </div>

        {/* 発言コンテンツ */}
        <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'} max-w-[80%]`}>
          <span className="text-white text-[10px] mb-1 font-black px-1 tracking-widest drop-shadow-md uppercase opacity-80">
            {name}
          </span>
          <div className={`relative p-4 rounded-2xl text-[13px] md:text-sm leading-relaxed shadow-xl
            ${isLeft 
              ? 'bg-white text-gray-800 rounded-tl-none ml-1' 
              : 'bg-[#85E249] text-gray-900 rounded-tr-none mr-1 shadow-[0_5px_15px_rgba(0,0,0,0.1)]'}
          `}>
            {text}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* メインチャットセクション */}
      <section className="bg-[#7494C0] rounded-3xl p-5 md:p-10 shadow-inner my-12 font-sans border-4 border-[#5b7ba8] relative overflow-hidden text-left">
        
        {/* 🏁 セッションヘッダー */}
        <div className="relative z-10 mb-10 text-center">
          <div className="inline-block px-4 py-0.5 bg-black/20 rounded-full mb-3">
            <span className="text-[9px] font-black text-white/70 tracking-[0.4em] uppercase">Neural_Network_Active</span>
          </div>
          <h2 className="text-white text-xl md:text-2xl font-black italic tracking-tighter drop-shadow-lg">
            「{sessionTitle}」
          </h2>
          <div className="w-20 h-1 bg-[#e94560] mx-auto mt-4 rounded-full shadow-[0_0_10px_#e94560]"></div>
        </div>
        
        {/* 会話ログの展開 */}
        <div className="space-y-2 relative z-10">
          {displayLogs.map((log, i) => {
            // A: シンプルな文字列配列の場合
            if (typeof log === 'string') {
              return renderMessage(`Agent_${i + 1}`, log, i, i % 2 === 0 ? 'left' : 'right');
            }

            // B: Q&Aペア形式 (user & assistant) の場合
            if (log?.user && log?.assistant) {
              return (
                <React.Fragment key={i}>
                  {renderMessage('User_Query', log.user, `${i}-q`, 'right')}
                  {renderMessage('AI_Concierge', log.assistant, `${i}-a`, 'left')}
                </React.Fragment>
              );
            }

            // C: オブジェクト形式 (role/content, name/text など) の場合
            const rawName = log?.role || log?.user || log?.name || `Agent_${i}`;
            const text = log?.content || log?.comment || log?.text || JSON.stringify(log);
            const isLeftOriented = rawName === 'assistant' || i % 2 === 0;

            return renderMessage(rawName, text, i, isLeftOriented ? 'left' : 'right');
          })}
        </div>

        {/* LINE風の質感を出す背景ドット装飾 */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </section>

      {/* 🔍 システムデバッグ表示 (URLに ?debug=true がある場合のみ) */}
      {isDebugMode && (
        <div className="mt-8 p-6 bg-black/90 rounded-2xl border border-green-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-bounce-in">
          <div className="flex items-center gap-3 mb-4 border-b border-green-500/20 pb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <p className="text-[11px] text-green-400 font-mono font-bold uppercase tracking-[0.2em]">Debug_Raw_Insight_Stream</p>
          </div>
          <pre className="text-[10px] text-gray-400 font-mono leading-relaxed overflow-auto max-h-60 scrollbar-thin scrollbar-thumb-green-900">
            {JSON.stringify(logs, null, 2)}
          </pre>
          <div className="mt-4 text-[9px] font-mono text-gray-600 italic">
            * This panel is only visible when URL parameter "debug=true" is active.
          </div>
        </div>
      )}
    </>
  );
}