/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 MODERN_FULLSTACK_SERIES_VOL_10_V1.0
 * 🛡️ Maya's Strategy: 365万件という実績を「未来への約束」に変換
 * 💎 Purpose: フルスタックエンジニアとしての完成度と情熱を最終アピール
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    List, 
    Calendar, 
    Clock, 
    User, 
    Globe,
    Cpu,
    Heart
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.10 総括：365万件の未来とフルスタックの地平 | BICSTATION",
        description: "Next.js, Django, Docker。すべての技術が統合されたとき、世界はどのように変わるのか。",
    });
}

export default function SeriesVol10() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/modern-fullstack-roadmap" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-blue-500/50">MODERN_FULLSTACK // VOL.10 (FINAL)</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16 border-l-4 border-blue-500 pl-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        総括：365万件の未来と<br />フルスタックの地平
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> 2026.04.22</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> 10 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-blue max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-blue-400 prose-code:text-blue-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-blue-500 pl-6">
                        "技術は手段ですが、その手段を極めることでしか到達できない表現があると信じています。"
                    </p>

                    <h2 id="integration">1. 統合された巨大なエコシステム</h2>
                    <p>
                        PHP編で培ったロジックを Django (Python) に移植し、Next.js で UI を再構築し、Docker でインフラを抽象化した。この旅の果てに誕生した BICSTATION は、365万件という膨大なデータを、まるで羽毛のように軽やかに、そして正確にユーザーへ届けています。
                    </p>

                    <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                            <Cpu className="text-blue-400 w-6 h-6 mb-3" />
                            <h4 className="text-white m-0 text-sm">Scalability</h4>
                            <p className="text-xs text-slate-400 mt-2">コンテナ化とキャッシュ戦略により、さらなるデータ増大にも耐えうる基盤を実現。</p>
                        </div>
                        <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                            <Globe className="text-blue-400 w-6 h-6 mb-3" />
                            <h4 className="text-white m-0 text-sm">Experience</h4>
                            <p className="text-xs text-slate-400 mt-2">RSC と ISR を組み合わせた、世界最高峰のレンダリング体験を提供。</p>
                        </div>
                    </div>

                    <h2 id="vision">2. エンジニアとしての矜持</h2>
                    <p>
                        私の開発における哲学は「見えない部分にこそ誠実であること」です。コードの背後にある正規化された DB 構造や、JWT による厳格な認証、そして徹底した SEO 設定。これらすべてが噛み合って、初めて BICSTATION という生命体が息づくのです。
                    </p>

                    <h2 id="final-message">3. 終わらない旅</h2>
                    <p>
                        365万件は通過点に過ぎません。これからも新しい技術を取り入れ、壊し、また作る。その繰り返しの先にしか、本物のエンジニアリングはないのだと、このプロジェクトを通じて改めて確信しました。
                    </p>
                </div>

                {/* 🧭 完結メッセージ */}
                <footer className="mt-24 p-12 bg-gradient-to-br from-blue-900/20 to-transparent rounded-3xl border border-blue-500/20 text-center">
                    <Heart className="w-10 h-10 text-blue-500 mx-auto mb-6 animate-pulse" />
                    <h2 className="text-3xl font-bold text-white mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                        Mission: Complete
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed max-w-md mx-auto">
                        全10巻にわたる連載にお付き合いいただき、心から感謝します。<br />
                        BICSTATION の物語は、ここから加速します。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="bg-white text-black font-bold py-3 px-10 rounded-full hover:bg-slate-200 transition-all">
                            ホームへ戻る
                        </Link>
                        <Link href="/contact" className="border border-white/20 text-white font-bold py-3 px-10 rounded-full hover:bg-white/5 transition-all">
                            お問い合わせ
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}