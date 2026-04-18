/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 NEXT_GEN_FULLSTACK_ROADMAP_VOL_9_V2.0
 * 🛡️ Maya's Logic: APIを直接晒さない。Nginxを鉄壁の守護神にする。
 * 💎 Purpose: 独自ドメイン運用、SSL化、セキュリティ対策のベストプラクティス。
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // ✅ 追加
import { 
    ChevronRight, 
    List, 
    Calendar, 
    Clock, 
    User, 
    ShieldCheck,
    Globe,
    Lock,
    Link2,
    ShieldAlert,
    Network
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

// ✅ メタデータ：セキュリティとネットワークを象徴するビジュアル
export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.9 Nginx 逆プロキシとSSL・セキュリティ対策 | BICSTATION",
        description: "独自ドメイン運用とAPIサーバーを隠蔽するネットワーク設計。HTTPS化とセキュリティの要諦。",
        image: "/images/series/nginx-security-eyecatch.webp",
    });
}

export default function NextGenVol9() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/ai-intelligence-engine" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-tighter">Roadmap // Vol.09</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <span className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase block mb-4">第4章：インフラ・デプロイ</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Nginx 逆プロキシと<br className="hidden md:block" />SSL・セキュリティ対策
                    </h1>

                    <div className="flex flex-wrap gap-6 text-[10px] font-mono text-slate-500 uppercase mb-12">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.26</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 11 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>

                    {/* ✅ アイキャッチ画像（Nginx Reverse Proxy & Security Architecture） */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-emerald-500/10 mb-16">
                        <Image
                            src="/images/series/nginx-security-eyecatch.webp" 
                            alt="BICSTATION Roadmap Vol.9: Nginx Reverse Proxy and Security"
                            fill
                            className="object-cover object-center transition-transform duration-500 hover:scale-105"
                            priority
                            sizes="(max-w-768px) 100vw, 768px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-mono text-white uppercase tracking-widest">Network Hardening</span>
                        </div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300 prose-p:font-light
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "インターネットは美しくも残酷な場所です。公開するということは、同時に攻撃に晒されるということ。Nginxはその最前線で戦う『盾』になります。"
                    </p>

                    <h2 id="reverse-proxy">1. 逆プロキシ：APIを世界から隠す技術</h2>
                    <p>
                        DjangoやNext.jsのポートを直接一般公開するのは極めて危険です。
                        私たちはNginxを**「逆プロキシ（Reverse Proxy）」**として配置し、外部からのアクセスを一手に引き受ける窓口としました。
                        Nginxが交通整理を行い、フロントのリクエストはNext.jsへ、データの問い合わせはDjangoへと、安全にルーティングします。
                    </p>

                    

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4 shadow-xl">
                        <Lock className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Security Fact</h4>
                            <p className="text-sm mt-2 mb-0">
                                公開ポートは80(HTTP)と443(HTTPS)のみ。内部のコンテナ間通信はDockerネットワーク内に閉じ込めることで、外部からの不正なDBアクセスや管理画面への直接侵入を物理的に遮断します。
                            </p>
                        </div>
                    </div>

                    <h2 id="ssl-certbot">2. 独自ドメインとSSL（HTTPS）化の徹底</h2>
                    <p>
                        BICSTATIONというブランドを確立するために、独自ドメインの運用は必須です。
                        Let's EncryptとCertbotを導入し、証明書の更新を完全自動化。
                        「保護されていない通信」という警告は、ユーザーの信頼だけでなく、Googleの検索評価（SEO）にも悪影響を及ぼします。HTTPS化は現代のWeb開発において、守るべき最低限の嗜みです。
                    </p>

                    <h2 id="hardening">3. セキュリティ・ハードニング（要塞化）</h2>
                    <p>
                        単に公開するだけでなく、攻撃を「いなす」設定も施しました。
                        NginxによるDDoS対策のレート制限、機密情報を隠蔽するHTTPヘッダーの付与、そして不要なメソッド（TRACEなど）の拒否。
                        これら一つ一つの積み重ねが、365万件の巨大なプラットフォームを24時間365日、平穏に保つための基盤となります。
                    </p>

                    <div className="my-10 p-6 bg-white/[0.03] border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4 text-emerald-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-mono uppercase">Harden Config Checklist</span>
                        </div>
                        <ul className="text-sm space-y-3 list-none p-0 text-slate-400">
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2">
                                <span className="text-emerald-500">✔</span>
                                <span>HSTS: 常時HTTPS接続を強制し、中間者攻撃を防止。</span>
                            </li>
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2">
                                <span className="text-emerald-500">✔</span>
                                <span>CORS Settings: 信頼できるオリジン以外からのAPI利用を制限。</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-emerald-500">✔</span>
                                <span>Firewall (UFW/ip-tables): サーバーレベルでの不要ポートの徹底閉鎖。</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="next-chapter">次回、ついに最終章：運用とマネタイズ</h2>
                    <p>
                        技術の城は完成しました。あとはこの城をどう動かし、どう成長させていくか。
                        第10回は**最終章：運用とマネタイズ編**。
                        Google AdSenseの突破、エンジニアとしての知見を収益に変えるサイクル、そして「個人プラットフォーム」を持つことの真の意味を語ります。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/99-archive/ai-intelligence-engine/vol-8" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-left">Previous Episode</span>
                            <div className="flex items-center justify-start gap-4">
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1 rotate-180" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-left text-sm">
                                    Vol.8 Docker による環境の完全同期
                                </span>
                            </div>
                        </Link>

                        <Link 
                            href="/series/99-archive/ai-intelligence-engine/vol-10" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-right">Next Episode</span>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm">
                                    Vol.10 運用とマネタイズのスタンダード
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/series/99-archive/ai-intelligence-engine" className="text-[10px] font-mono text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">
                            Back to Roadmap Index
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}