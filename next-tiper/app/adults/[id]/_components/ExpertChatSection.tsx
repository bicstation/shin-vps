/* ExpertChatSection.tsx */
import React from 'react';

export default function ExpertChatSection({ logs }) {
  // logsが空、または配列でない場合はデバッグ情報を出す
  if (!logs || !Array.isArray(logs) || logs.length === 0) {
    return (
      <div className="bg-black text-green-400 p-4 font-mono text-xs rounded-lg border border-green-900 my-4">
        <p className="mb-2 font-bold">[DEBUG: NO_LOGS_RECEIVED]</p>
        <pre>{JSON.stringify(logs, null, 2)}</pre>
      </div>
    );
  }

  /**
   * 🔄 内部関数：単一メッセージを描画する
   * どんなキー名で来ても「質問者」か「AI」かを判定してレンダリング
   */
  const renderMessage = (nameRaw, text, index, isAssistantOverride = false) => {
    // role: assistant や assistantキー経由ならAI、それ以外（user等）は質問者
    const isAI = isAssistantOverride || nameRaw === 'assistant' || nameRaw.includes("A") || nameRaw.includes("賢者") || nameRaw.includes("蒐集家");
    const displayName = isAI ? (nameRaw === 'assistant' ? 'AIコンシェルジュ' : nameRaw) : (nameRaw === 'user' ? '質問者' : nameRaw);

    return (
      <div 
        key={index} 
        className={`flex ${isAI ? 'flex-row' : 'flex-row-reverse'} items-start gap-3 animate-fade-in mb-6`}
      >
        {/* アイコン */}
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white shadow-lg bg-black">
            <img 
              src={isAI ? "/src/images/expert_01.png" : "/src/images/expert_02.png"} 
              className="w-full h-full object-cover"
              alt={displayName}
            />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${isAI ? 'bg-green-500' : 'bg-blue-400'}`}></div>
        </div>

        {/* テキスト */}
        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} max-w-[80%]`}>
          <span className="text-white text-[11px] mb-1 font-bold px-1 drop-shadow-md">
            {displayName}
          </span>
          <div className={`relative p-4 rounded-2xl text-[13px] md:text-sm leading-relaxed shadow-md
            ${isAI 
              ? 'bg-white text-gray-800 rounded-tl-none ml-1' 
              : 'bg-[#85E249] text-gray-800 rounded-tr-none mr-1'}
          `}>
            {text}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-[#7494C0] rounded-2xl p-4 md:p-8 shadow-inner my-12 font-sans overflow-hidden border-4 border-[#5b7ba8]">
      <div className="flex items-center justify-between mb-6 border-b border-white/20 pb-2">
        <h3 className="text-white text-[10px] font-black tracking-[0.4em] uppercase">Expert_Insight_Logs</h3>
        <span className="text-white/40 text-[9px] font-mono">ENCRYPTED_CHANNEL</span>
      </div>
      
      <div className="space-y-2">
        {logs.map((log, i) => {
          // パターン1: { user: "...", assistant: "..." } のペア形式（今朝のデータ）
          if (log.user && log.assistant) {
            return (
              <React.Fragment key={i}>
                {renderMessage('user', log.user, `${i}-q`)}
                {renderMessage('assistant', log.assistant, `${i}-a`, true)}
              </React.Fragment>
            );
          }

          // パターン2: { role: "...", content: "..." } または { user: "...", comment: "..." } のフラット形式
          const nameRaw = log?.role || log?.user || "Unknown";
          const text = log?.content || log?.comment || "Communication_Interrupted...";
          return renderMessage(nameRaw, text, i);
        })}
      </div>

      {/* RAW DATA DEBUG PANEL */}
      <div className="mt-12 pt-4 border-t border-white/10">
        <details className="cursor-pointer">
          <summary className="text-white/30 text-[9px] font-mono hover:text-white transition-colors">
            RAW_DATA_PAYLOAD_INSPECTION
          </summary>
          <div className="mt-4 bg-black/80 backdrop-blur p-4 rounded-lg border border-white/10 overflow-x-auto">
            <pre className="text-green-500 text-[10px] font-mono leading-tight">
              {JSON.stringify(logs, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </section>
  );
}