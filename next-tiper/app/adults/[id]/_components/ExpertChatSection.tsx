/* ExpertChatSection.tsx */
import React from 'react';

export default function ExpertChatSection({ logs }) {
  if (!logs || !Array.isArray(logs) || logs.length === 0) {
    return null; // データがない時は静かに消える
  }

  /**
   * 🔄 究極のメッセージ解析関数
   */
  const renderMessage = (name, text, index, side = 'left') => {
    const isLeft = side === 'left';
    return (
      <div key={index} className={`flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-start gap-3 animate-fade-in mb-6`}>
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white shadow-lg bg-black">
            <img 
              src={isLeft ? "/src/images/expert_01.png" : "/src/images/expert_02.png"} 
              className="w-full h-full object-cover"
              alt={name}
            />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${isLeft ? 'bg-green-500' : 'bg-blue-400'}`}></div>
        </div>
        <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'} max-w-[80%]`}>
          <span className="text-white text-[11px] mb-1 font-bold px-1 drop-shadow-md">{name}</span>
          <div className={`relative p-4 rounded-2xl text-[13px] md:text-sm leading-relaxed shadow-md
            ${isLeft ? 'bg-white text-gray-800 rounded-tl-none ml-1' : 'bg-[#85E249] text-gray-800 rounded-tr-none mr-1'}
          `}>
            {text}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-[#7494C0] rounded-2xl p-4 md:p-8 shadow-inner my-12 font-sans border-4 border-[#5b7ba8]">
      <div className="flex items-center justify-between mb-6 border-b border-white/20 pb-2 text-white">
        <h3 className="text-[10px] font-black tracking-[0.4em] uppercase">Expert_Insight_Logs</h3>
        <span className="text-[9px] font-mono opacity-40">ENCRYPTED_CHANNEL</span>
      </div>
      
      <div className="space-y-2">
        {logs.map((log, i) => {
          // --- パターン1: ただの文字列の場合（今朝の新しいパターン） ---
          if (typeof log === 'string') {
            return renderMessage(`Agent_${i + 1}`, log, i, i % 2 === 0 ? 'left' : 'right');
          }

          // --- パターン2: { user, assistant } のペア形式 ---
          if (log?.user && log?.assistant) {
            return (
              <React.Fragment key={i}>
                {renderMessage('User_Query', log.user, `${i}-q`, 'right')}
                {renderMessage('AI_Concierge', log.assistant, `${i}-a`, 'left')}
              </React.Fragment>
            );
          }

          // --- パターン3: { role, content } などの標準形式 ---
          const rawName = log?.role || log?.user || `Agent_${i}`;
          const text = log?.content || log?.comment || log?.text || "...";
          const isAI = rawName === 'assistant' || rawName.includes("A") || i % 2 === 0;
          
          return renderMessage(rawName, text, i, isAI ? 'left' : 'right');
        })}
      </div>
    </section>
  );
}