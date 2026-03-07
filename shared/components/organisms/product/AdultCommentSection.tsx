/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';

interface ChatComment {
  user: string;
  comment: string;
}

interface AdultCommentSectionProps {
  productId: number | string;
  aiChatComments?: ChatComment[]; // JSONの ai_chat_comments を受け取る
}

export default function AdultCommentSection({ productId, aiChatComments = [] }: AdultCommentSectionProps) {
  return (
    <div className="space-y-10">
      {/* --- AI Chat Logs (Neural Feedback) --- */}
      <div className="grid gap-6">
        {aiChatComments.length > 0 ? (
          aiChatComments.map((node, i) => (
            <div key={i} className="group relative bg-white/[0.02] border border-white/5 p-5 transition-all hover:bg-white/[0.04]">
              <div className="absolute top-0 left-0 w-[2px] h-full bg-[#00d1b2] shadow-[0_0_10px_#00d1b2]" />
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#00d1b2] rounded-full animate-pulse" />
                  <span className="text-[11px] font-black text-[#00d1b2] uppercase tracking-widest">
                    {node.user}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-gray-600 uppercase">Analysis_Node_0{i + 1}</span>
              </div>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed italic font-serif opacity-90">
                「{node.comment}」
              </p>
            </div>
          ))
        ) : (
          <div className="py-10 text-center border border-dashed border-white/10 opacity-30">
            <p className="text-xs font-mono tracking-[0.3em]">NO_CONVERSATION_LOGS_AVAILABLE</p>
          </div>
        )}
      </div>

      {/* --- Dummy Input Form (見た目の完成度用) --- */}
      <div className="mt-20 p-6 bg-black/40 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#e94560]/5 rounded-full -mr-12 -mt-12 blur-2xl" />
        <h4 className="text-[10px] font-black text-[#e94560] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#e94560]" />
          Establish_New_Node
        </h4>
        <textarea
          placeholder="Transmit your feedback to the network..."
          className="w-full bg-black/60 border border-white/5 p-4 text-xs font-mono text-gray-400 focus:outline-none focus:border-[#e94560] transition-colors min-h-[100px] resize-none"
        />
        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-600 font-mono tracking-tighter">ENCRYPTION: AES-256</span>
            <span className="text-[8px] text-[#00d1b2] font-mono tracking-tighter">SIGNAL: SECURE</span>
          </div>
          <button className="px-8 py-2 bg-transparent border border-[#e94560] text-[#e94560] text-[10px] font-black uppercase tracking-widest hover:bg-[#e94560] hover:text-white transition-all cursor-not-allowed">
            Send_Packet
          </button>
        </div>
      </div>
    </div>
  );
}