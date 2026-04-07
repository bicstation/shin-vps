'use client';
import React, { useState, useEffect } from 'react';

/**
 * =====================================================================
 * 🛡️ Maya's Logic: Live Chat Connection LP [完全版]
 * ---------------------------------------------------------------------
 * 設置パス: /app/guide/live-chat/page.tsx
 * 特徴:
 * 1. リアルタイム・タイムスタンプによる「今」感の演出
 * 2. 待機人数および擬似ログの動的変動
 * 3. 視認性の高いパルスアニメーションボタン
 * =====================================================================
 */
export default function LiveChatLP() {
    const [mounted, setMounted] = useState(false);
    const [activeUsers, setActiveUsers] = useState(12);
    const [currentTime, setCurrentTime] = useState('');

    // 🥂 ライブチャット・エリート案件リンク（適切なリンクに差し替えてください）
    const LINK_CHAT = "https://px.a8.net/svt/ejp?a8mat=OET7H+CC7ELE+BM2+BYT9F";

    useEffect(() => {
        setMounted(true);
        
        // 現在時刻の更新
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        updateTime();
        const timeInterval = setInterval(updateTime, 1000);

        // リアルタイム感を出すためのユーザー数変動演出
        const userInterval = setInterval(() => {
            setActiveUsers(prev => {
                const change = Math.floor(Math.random() * 5) - 2;
                const next = prev + change;
                return next < 8 ? 9 : next > 25 ? 24 : next;
            });
        }, 4000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(userInterval);
        };
    }, []);

    if (!mounted) return null;

    return (
        <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', paddingBottom: '60px' }}>
            {/* 🚨 規約・警告表示 */}
            <div style={{ backgroundColor: '#ff0055', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', textAlign: 'center', padding: '8px', letterSpacing: '0.05em' }}>
                🔞 ADULT ONLY: 18歳未満の方、および高校生の方は利用できません
            </div>

            {/* 📸 メインビジュアル演出 */}
            <section style={{ 
                position: 'relative', 
                height: '45vh', 
                background: 'linear-gradient(rgba(0,0,0,0.3), #050505), url("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80") center/cover',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '30px'
            }}>
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '15px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(0,255,0,0.5)' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#00ff00', borderRadius: '50%', boxShadow: '0 0 10px #00ff00', animation: 'blink 1.5s infinite' }}></span>
                        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#00ff00' }}>LIVE: {activeUsers}名のキャストが待機中</span>
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '900', lineHeight: '1.1', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                        2秒で繋がる。<br /><span style={{ color: '#ff0055' }}>秘密のビデオトーク</span>
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '10px' }}>{currentTime} 現在の接続状況：良好</p>
                </div>
            </section>

            <main style={{ padding: '0 20px', maxWidth: '600px', margin: '0 auto' }}>
                {/* 💬 擬似チャットログ演出 */}
                <div style={{ backgroundColor: '#111', borderRadius: '15px', padding: '18px', border: '1px solid #222', marginBottom: '30px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                    <p style={{ color: '#ff0055', fontSize: '0.75rem', marginBottom: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                        <span>SYSTEM: 近隣エリアでマッチング中...</span>
                        <span style={{ animation: 'blink 1s infinite' }}>● REC</span>
                    </p>
                    <div style={{ fontSize: '0.85rem', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ color: '#444' }}>[{currentTime.split(':')[0]}:{currentTime.split(':')[1]}]</span>
                            <p>👤 20代女性（事務職）がログインしました</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ color: '#444' }}>[{currentTime.split(':')[0]}:{currentTime.split(':')[1]}]</span>
                            <p>💎 佐藤さんが通話（15分）を終了しました</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', color: '#eee' }}>
                            <span style={{ color: '#ff0055' }}>HOT</span>
                            <p>「今夜は誰かとゆっくり話したいな...」</p>
                        </div>
                    </div>
                </div>

                {/* 🚀 メインアクション */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '18px', color: '#bbb' }}>面倒な登録は不要。匿名・顔出しなしで開始可能。</p>
                    <a href={LINK_CHAT} target="_blank" rel="noopener noreferrer" className="main-pulse-button" style={{ 
                        display: 'block', 
                        backgroundColor: '#ff0055', 
                        color: '#fff', 
                        padding: '22px', 
                        borderRadius: '50px', 
                        fontSize: '1.4rem', 
                        fontWeight: '900', 
                        textDecoration: 'none', 
                        boxShadow: '0 10px 30px rgba(255, 0, 85, 0.4)',
                        border: '2px solid rgba(255,255,255,0.1)'
                    }}>
                        今すぐ接続して話す ➔
                    </a>
                </div>

                {/* 🛡️ メリット訴求 */}
                <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {[
                        { title: '顔出し不要', desc: '音声通話のみでも接続OK', icon: '👤' },
                        { icon: '🛡️', title: '24h監視', desc: '不適切なユーザーを排除' },
                        { icon: '🔐', title: '秘密厳守', desc: '端末に履歴を残しません' },
                        { icon: '💰', title: '定額・安心', desc: '前払いポイント制で安心' }
                    ].map((item, i) => (
                        <div key={i} style={{ backgroundColor: '#0a0a0a', border: '1px solid #222', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{item.icon}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#ff0055', marginBottom: '4px' }}>{item.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#777', lineHeight: '1.4' }}>{item.desc}</div>
                        </div>
                    ))}
                </div>

                    <div>
                        <iframe id="onlineBanner" frameborder="0" scrolling="no" width="640" height="200" src="https://livechat.dmm.co.jp/publicads?&size=L&design=A&affiliate_id=bicbic-014"></iframe>
                    </div>

            </main>

            <footer style={{ marginTop: '60px', padding: '30px 20px', textAlign: 'center', fontSize: '0.7rem', color: '#444', borderTop: '1px solid #111' }}>
                <div style={{ marginBottom: '10px' }}>
                    <span style={{ margin: '0 10px' }}>運営概要</span>
                    <span style={{ margin: '0 10px' }}>利用規約</span>
                    <span style={{ margin: '0 10px' }}>プライバシーポリシー</span>
                </div>
                © 2026 tiper.live - LiveChat Connection Guide<br />
                ※当ページはアフィリエイト広告を利用しています。
            </footer>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 10px 30px rgba(255, 0, 85, 0.4); }
                    50% { transform: scale(1.03); box-shadow: 0 15px 45px rgba(255, 0, 85, 0.6); }
                    100% { transform: scale(1); box-shadow: 0 10px 30px rgba(255, 0, 85, 0.4); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                .main-pulse-button {
                    animation: pulse 2s infinite ease-in-out;
                    transition: all 0.3s ease;
                }
                .main-pulse-button:hover {
                    background-color: #ff2b70;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}