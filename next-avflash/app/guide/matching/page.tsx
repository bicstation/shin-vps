'use client';
import React, { useState, useEffect } from 'react';

export default function MatchingGuide() {
    const [mounted, setMounted] = useState(false);
    const [scanStatus, setScanStatus] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [matchCount, setMatchCount] = useState(247);
    const [currentTime, setCurrentTime] = useState('');
    
    // 🔔 ポップアップ制御用
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState({ name: '', action: '', icon: '' });

    // アフィリエイトリンク設定
    const LINK_HAPPY = 'https://px.a8.net/svt/ejp?a8mat=2TVVK1+4TI5E+HCG+ZQNG3'; 
    const LINK_PCMAX = 'https://px.a8.net/svt/ejp?a8mat=1HYB57+48H06A+YQK+7HUIB'; 
    const LINK_WAKU  = 'https://px.a8.net/svt/ejp?a8mat=2TVVK1+778KI+1KZ4+NTZCJ'; 
    const LINK_STRIP = 'https://tiper.live/live'; 

    // 📣 ポップアップ用通知リスト
    const notifications = [
        { name: '32歳・会社員（東京都）', action: 'がハッピーメールに無料登録しました', icon: '👤' },
        { name: '28歳・自営業（大阪府）', action: 'がPCMAXでマッチングに成功！', icon: '✨' },
        { name: '匿名ユーザー', action: 'がワクワクメールで掲示板に投稿しました', icon: '📝' },
        { name: '24歳・女性（神奈川）', action: 'が今すぐ会える相手を募集中', icon: '💖' },
        { name: '45歳・管理職（愛知県）', action: 'がお試しポイントで通話を開始', icon: '📞' },
        { name: '35歳・公務員（福岡県）', action: 'がプロフ写真を更新しました', icon: '📸' }
    ];

    useEffect(() => { 
        setMounted(true); 
        
        // 時刻のリアルタイム更新
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('ja-JP'));
        }, 1000);

        // 🚀 ポップアップ演出のループ
        const triggerPopup = () => {
            const randomData = notifications[Math.floor(Math.random() * notifications.length)];
            setPopupContent(randomData);
            setShowPopup(true);
            
            // 6秒表示して隠す
            setTimeout(() => {
                setShowPopup(false);
                // 次の表示までランダムに10〜15秒空ける
                setTimeout(triggerPopup, Math.random() * 5000 + 10000); 
            }, 6000);
        };

        // 【確実性向上】初回出現をページ読み込み3秒後に短縮
        const firstPopupTimer = setTimeout(triggerPopup, 3000);

        return () => {
            clearInterval(timer);
            clearTimeout(firstPopupTimer);
        };
    }, []);

    const startScan = () => {
        setScanStatus('searching'); 
        setProgress(0);
        const randomNum = Math.floor(Math.random() * (259 - 241 + 1)) + 241;
        setMatchCount(randomNum);
        
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) { 
                    clearInterval(interval); 
                    setTimeout(() => setScanStatus('result'), 600); 
                    return 100; 
                }
                return prev + Math.floor(Math.random() * 8) + 2;
            });
        }, 80);
    };

    if (!mounted) return null;

    return (
        <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', paddingBottom: '120px', color: '#0f172a', fontFamily: '-apple-system, sans-serif', position: 'relative' }}>
            
            {/* リーガル表記 */}
            <div style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '10px', textAlign: 'center', fontSize: '10px', letterSpacing: '0.05em', position: 'relative', zIndex: 10 }}>
                【広告】本ページにはプロモーションが含まれます。 🔞 18歳未満・高校生は利用禁止。
            </div>

            {/* ヘッダー */}
            <section style={{ background: 'linear-gradient(180deg, #1e293b 0%, #020617 100%)', color: 'white', padding: '40px 20px', textAlign: 'center', borderBottom: '5px solid #fbbf24' }}>
                <p style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.1em' }}>2026 EDITION</p>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '900', lineHeight: '1.3' }}>最新マッチング解析システム<br /><span style={{ color: '#ef4444' }}>「本当に出会える」</span>最強TOP3</h1>
            </section>

            <main style={{ maxWidth: '500px', margin: '-20px auto 0', padding: '0 15px', position: 'relative', zIndex: 5 }}>
                {/* 🛰️ メインスキャンボックス */}
                <div style={{ margin: '20px 0', padding: '30px 20px', borderRadius: '24px', background: '#ffffff', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    {scanStatus === 'idle' && (
                        <div>
                            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🛰️</div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: 'bold' }}>周辺エリアをスキャン中...</h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '25px' }}>GPS情報を元にアクティブユーザーを抽出します</p>
                            <button onClick={startScan} style={{ background: 'linear-gradient(to right, #ef4444, #b91c1c)', color: 'white', width: '100%', padding: '20px', borderRadius: '18px', fontWeight: '900', fontSize: '1.3rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.4)' }}>スキャンを開始する</button>
                        </div>
                    )}

                    {scanStatus === 'searching' && (
                        <div style={{ padding: '20px 0' }}>
                            <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#ef4444', transition: 'width 0.1s ease-out' }}></div>
                            </div>
                            <p style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: '900' }}>
                                データベース解析中... {progress}%
                            </p>
                        </div>
                    )}

                    {scanStatus === 'result' && (
                        <div>
                            <div style={{ display: 'inline-block', padding: '4px 14px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '20px', color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '15px' }}>
                                🟢 REAL-TIME SYNCED: {currentTime}
                            </div>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '25px', lineHeight: '1.4' }}>
                                近隣エリアで <span style={{ fontSize: '2.5rem', color: '#ef4444', borderBottom: '3px solid #ef4444' }}>{matchCount}名</span> の<br/>マッチング候補を検出
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                <a href={LINK_HAPPY} target='_blank' rel="noopener noreferrer" style={{ background: '#000', color: '#fff', padding: '20px', borderRadius: '14px', fontWeight: 'bold', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}>
                                    <span style={{background:'#ef4444', padding:'2px 8px', borderRadius:'4px', fontSize:'0.75rem'}}>人気No.1</span> ハッピーメール(18禁)
                                </a>
                                <a href={LINK_PCMAX} target='_blank' rel="noopener noreferrer" style={{ background: '#fbbf24', color: '#000', padding: '20px', borderRadius: '14px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}>
                                    即会い特化：PCMAX(18禁)
                                </a>
                                <a href={LINK_WAKU} target='_blank' rel="noopener noreferrer" style={{ background: '#0ea5e9', color: '#fff', padding: '20px', borderRadius: '14px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}>
                                    コスパ重視：ワクワク(18禁)
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* 🏆 ランキング詳細 */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>🏆 2026年度 決定版ランキング</h3>
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
                        <div style={{ marginBottom: '20px', borderLeft: '4px solid #ef4444', paddingLeft: '15px' }}>
                            <strong style={{ color: '#ef4444', fontSize: '1.1rem' }}>【1位】ハッピーメール</strong><br/>
                            <span style={{ color: '#64748b' }}>国内最大級の会員数。初心者がまず登録すべき「出会いの登竜門」。圧倒的なマッチング率を誇ります。</span>
                        </div>
                        <div style={{ marginBottom: '20px', borderLeft: '4px solid #f59e0b', paddingLeft: '15px' }}>
                            <strong style={{ color: '#f59e0b', fontSize: '1.1rem' }}>【2位】PCMAX</strong><br/>
                            <span style={{ color: '#64748b' }}>掲示板の活発さが異常。今夜すぐに会いたい、大人の関係を求めるならここが最短ルート。</span>
                        </div>
                        <div style={{ borderLeft: '4px solid #0ea5e9', paddingLeft: '15px' }}>
                            <strong style={{ color: '#0ea5e9', fontSize: '1.1rem' }}>【3位】ワクワクメール</strong><br/>
                            <span style={{ color: '#64748b' }}>長年の運営実績。無料ポイント配布が多く、無課金・低予算でも十分に戦えるのが最大の魅力。</span>
                        </div>
                    </div>
                </div>

                {/* 🔞 特化型LP導線 */}
                <div style={{ background: '#fff1f2', padding: '25px', borderRadius: '24px', border: '2px dashed #fda4af', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#e11d48', fontWeight: 'bold', marginBottom: '12px' }}>＼ 会う前に「生」で確認したい方へ ／</p>
                    <a href={LINK_STRIP} target='_blank' rel="noopener noreferrer" style={{ color: '#0f172a', fontWeight: '900', textDecoration: 'none', fontSize: '1.1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span>📺 24時間ライブ配信(日本・海外)</span>
                        <span style={{ fontSize: '0.8rem', color: '#f43f5e', textDecoration: 'underline' }}>【無料】今すぐリアルタイムで覗く ➔</span>
                    </a>
                </div>
            </main>

            {/* 🔔 修正：RootLayoutの影響を無視して最前面へ出すポップアップ */}
            <div style={{ 
                position: 'fixed', 
                bottom: '40px', 
                left: '50%', // 画面の横中央を基準に
                transform: showPopup ? 'translate(-50%, 0)' : 'translate(-50%, 200px)', // 横中央を維持しながら上下移動
                zIndex: 999999, // RootLayoutの全ての要素を上書き
                display: 'flex', 
                justifyContent: 'center', 
                pointerEvents: 'none',
                width: '100%',
                opacity: showPopup ? 1 : 0,
                transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
            }}>
                <div style={{ 
                    backgroundColor: '#ffffff', color: '#1e293b', 
                    padding: '14px 18px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '14px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', border: '1px solid #e2e8f0',
                    maxWidth: '380px', width: 'calc(100% - 30px)',
                    pointerEvents: 'auto' 
                }}>
                    <div style={{ width: '45px', height: '45px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1px solid #e2e8f0' }}>
                        {popupContent.icon}
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ef4444', letterSpacing: '0.05em' }}>⚡ JUST NOW</div>
                        <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                            <span style={{ fontWeight: '800' }}>{popupContent.name}</span><br />
                            <span style={{ color: '#475569' }}>{popupContent.action}</span>
                        </div>
                    </div>
                </div>
            </div>

            <footer style={{ marginTop: '50px', textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '11px', borderTop: '1px solid #e2e8f0' }}>
                © 2026 Matching Analysis Team. All Rights Reserved.<br/>
                法令を遵守し、18歳未満の方の利用は固くお断りいたします。
            </footer>
        </div>
    );
}