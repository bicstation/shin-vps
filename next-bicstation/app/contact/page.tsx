/* eslint-disable @next/next/no-img-element */
// /home/maya/dev/shin-vps/next-bicstation/app/contact/page.tsx

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ContactChatInner from './ContactChatInner'; // ロジック部分を分離して読み込み

/**
 * =============================================================================
 * 🌐 サーバーセクション (Metadata & Configuration)
 * サーバーコンポーネントとして動作させるため、ここでは "use client" を使いません。
 * =============================================================================
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: 'コンシェルジュ相談窓口 | BICSTATION',
    description: 'AIコンシェルジュがあなたに最適なPC選びをサポートします。ご予算や用途に合わせたリアルタイム提案。',
};

/**
 * =============================================================================
 * 🏗️ ページエントリポイント
 * =============================================================================
 */
export default function ContactPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-8 h-8 border-t-2 border-pink-500 animate-spin mb-4 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
                Initializing_Concierge_System...
            </div>
        }>
            <ContactChatInner />
        </Suspense>
    );
}