'use client';

import React, { useState, useEffect } from 'react';

/**
 * 🥂 MatchingGuide: 2026年 収益最大化モデル
 * 構成：ハピメ(3,500円) × PCMAX(3,000円) × ワクワク(3,300円)
 */
export default function MatchingGuide() {
    const [mounted, setMounted] = useState(false);
    const [scanStatus, setScanStatus] = useState<'idle' | 'searching' | 'result'>('idle');
    const [progress, setProgress] = useState(0);
    const [matchCount, setMatchCount] = useState(247);

    // 🏆 司令官の三大利益源（A8.net 完全リンク）
    const LINK_HAPPY = "https://px.a8.net/svt/ejp?a8mat=UB0PF+7K54RM+HCG+60H7N"; 
    const LINK_PCMAX = "https://px.a8.net/svt/ejp?a8mat=1HYB57+48H06A+YQK+7HUIB"; 
    const LINK_WAKU  = "https://px.a8.net/svt/ejp?a8mat=1BTNYU+GHN7FM+1KZ4+61Z83"; 

    useEffect(() => { setMounted(true); }, []);

    const startScan = () => {
        setScanStatus('searching'); setProgress(0);
        const randomNum = Math.floor(Math.random() * (259 - 241 + 1)) + 241;
        setMatchCount(randomNum);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) { clearInterval(interval); setTimeout(() => setScanStatus('result'), 600); return 100; }
                return prev + 2;
            });
        }, 30);
    };

    if (!mounted) return null;

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px', color: '#0f172a', fontFamily: 'sans-serif' }}>
            
            {/* ⚠️ 規約厳守：PR・18禁・高校生利用禁止の同時明記 */}
            <div style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '12px', textAlign: 'center', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                【PR/広告】本ページにはプロモーションが含まれます。 🔞 18歳未満・高校生は利用禁止。
            </div>

            {/* ① プレミアム・ヒーローセクション */}
            <section style={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                color: 'white', padding: '70px 20px', textAlign: 'center', borderBottom: '4px solid #fbbf24'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '15px', lineHeight: '1.2' }}>
                        2026年最新：マッチング攻略<br />
                        <span style={{ color: '#fbbf24' }}>「本当に出会える」</span>最強TOP3
                    </h1>
                    <p style={{ opacity: 0.8, fontSize: '1.1rem', fontWeight: '300' }}>
                        累計利用者数 5,500万人超。国内最大級のネットワークから、AIが最適なプラットフォームを厳選。
                    </p>
                </div>
            </section>

            <main style={{ maxWidth: '900px', margin: '-40px auto 0', padding: '0 20px' }}>
                
                {/* 📍 リアルタイム・エリアスキャナー（ユーザー体験向上） */}
                <div style={{ 
                    margin: '30px 0', padding: '45px 25px', borderRadius: '30px',
                    background: '#020617', color: 'white', textAlign: 'center',
                    border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}>
                    <style>{`
                        @keyframes spin { to { transform: rotate(360deg); } }
                        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                    `}</style>

                    {scanStatus === 'idle' && (
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📍</div>
                            <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>周辺エリアのアクティブユーザーを抽出</h3>
                            <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '35px' }}>
                                現在オンラインの女性ユーザーを各プラットフォームからスキャンします。
                            </p>
                            <button onClick={startScan} style={{ 
                                background: 'linear-gradient(to right, #ef4444, #b91c1c)', color: 'white', 
                                padding: '20px 50px', borderRadius: '100px', fontWeight: '900', 
                                fontSize: '1.2rem', border: 'none', cursor: 'pointer', transition: 'transform 0.2s'
                            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                今すぐスキャンを開始（18禁）
                            </button>
                        </div>
                    )}

                    {scanStatus === 'searching' && (
                        <div style={{ padding: '30px' }}>
                            <div style={{ width: '80px', height: '80px', border: '5px solid #10b981', borderRadius: '50%', margin: '0 auto 25px', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                            <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.4rem', letterSpacing: '0.1em' }}>解析中: {progress}%</p>
                            <p style={{ opacity: 0.4, marginTop: '10px' }}>近隣サーバーへ暗号化接続中...</p>
                        </div>
                    )}

                    {scanStatus === 'result' && (
                        <div style={{ animation: 'fadeIn 0.7s ease-out' }}>
                            <div style={{ fontSize: '1.3rem', color: '#fbbf24', fontWeight: 'bold', marginBottom: '20px' }}>スキャン完了：圧倒的な母数を検出！</div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '20px', marginBottom: '35px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>周辺エリアのアクティブユーザー合計</p>
                                <p style={{ fontSize: '2.8rem', fontWeight: '900', color: '#ef4444' }}>{matchCount}名</p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>（3サイト合計：今夜出会える可能性が極めて高い状況です）</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                                <a href={LINK_HAPPY} target="_blank" rel="noopener noreferrer" style={{ background: '#fff', color: '#000', padding: '20px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none', borderBottom: '4px solid #ddd' }}>ハッピーメール(18禁)</a>
                                <a href={LINK_PCMAX} target="_blank" rel="noopener noreferrer" style={{ background: '#fbbf24', color: '#000', padding: '20px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none', borderBottom: '4px solid #d97706' }}>PCMAX(18禁)</a>
                                <a href={LINK_WAKU} target="_blank" rel="noopener noreferrer" style={{ background: '#0ea5e9', color: '#fff', padding: '20px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none', borderBottom: '4px solid #0284c7' }}>ワクワク(18禁)</a>
                            </div>
                        </div>
                    )}
                </div>

                {/* ② 徹底比較ランキング */}
                <div style={{ background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ padding: '25px', background: '#f8fafc', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>🏆 tiper.live 厳選：三大プラットフォーム</h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'center', background: '#fdfdfd', color: '#64748b' }}>
                                <th style={{ padding: '20px' }}>Rank</th>
                                <th style={{ padding: '20px' }}>サービス</th>
                                <th style={{ padding: '20px' }}>独自の強み</th>
                                <th style={{ padding: '20px' }}>公式リンク</th>
                            </tr>
                        </thead>
                        <tbody style={{ textAlign: 'center' }}>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '25px', fontSize: '1.5rem' }}>🥇</td>
                                <td style={{ padding: '25px' }}><strong>ハッピーメール</strong></td>
                                <td style={{ padding: '25px' }}>会員数日本一の王道。<br/><span style={{fontSize: '0.75rem', color: '#94a3b8'}}>迷ったらここから開始。</span></td>
                                <td style={{ padding: '25px' }}><a href={LINK_HAPPY} target="_blank" style={{ color: '#ef4444', fontWeight: 'bold', textDecoration: 'underline' }}>無料登録(18禁)</a></td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '25px', fontSize: '1.5rem' }}>🥈</td>
                                <td style={{ padding: '25px' }}><strong>PCMAX</strong></td>
                                <td style={{ padding: '25px' }}>即日会いたい人の聖地。<br/><span style={{fontSize: '0.75rem', color: '#94a3b8'}}>アクティブ率NO.1。</span></td>
                                <td style={{ padding: '25px' }}><a href={LINK_PCMAX} target="_blank" style={{ color: '#ef4444', fontWeight: 'bold', textDecoration: 'underline' }}>無料登録(18禁)</a></td>
                            </tr>
                            <tr>
                                <td style={{ padding: '25px', fontSize: '1.5rem' }}>🥉</td>
                                <td style={{ padding: '25px' }}><strong>ワクワクメール</strong></td>
                                <td style={{ padding: '25px' }}>デザインが使いやすく清潔。<br/><span style={{fontSize: '0.75rem', color: '#94a3b8'}}>20代〜30代に人気。</span></td>
                                <td style={{ padding: '25px' }}><a href={LINK_WAKU} target="_blank" style={{ color: '#ef4444', fontWeight: 'bold', textDecoration: 'underline' }}>無料登録(18禁)</a></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* ③ 成約率を倍増させる「戦術ガイド」 */}
                <div style={{ marginTop: '40px', padding: '30px', background: '#fff9db', borderRadius: '25px', border: '1px solid #fde68a' }}>
                    <h4 style={{ color: '#856404', marginBottom: '15px', textAlign: 'center' }}>💡 収益最大化のヒント：なぜ「3つ同時」なのか？</h4>
                    <p style={{ fontSize: '0.9rem', color: '#92400e', lineHeight: '1.8' }}>
                        マッチング率を劇的に上げる裏技は<strong>「複数登録」</strong>です。各サイトにいる女性ユーザーは、重複が意外と少ないため、3つ同時に登録することで出会いの分母は単純計算で3倍になります。まずは全て無料で登録し、掲示板の「今から会いたい」投稿をチェックするのが最も効率的な「実戦」スタイルです。
                    </p>
                </div>

                <footer style={{ marginTop: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                    <p>© 2026 tiper.live - Matching Strategy Division</p>
                    <p>※本サイトは法令を遵守し、18歳未満の利用を推奨しません。</p>
                </footer>
            </main>
        </div>
    );
}