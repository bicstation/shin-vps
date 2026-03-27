'use client';
import React, { useState, useEffect } from 'react';

export default function LiveChatLP() {
    const [mounted, setMounted] = useState(false);
    const [activeUsers, setActiveUsers] = useState(12);

    // 🥂 ライブチャット・エリート案件リンク（A8等）
    const LINK_CHAT = "https://px.a8.net/svt/ejp?a8mat=YOUR_LINK_HERE";

    useEffect(() => {
        setMounted(true);
        // リアルタイム感を出すためのユーザー数変動演出
        const interval = setInterval(() => {
            setActiveUsers(prev => Math.max(8, prev + Math.floor(Math.random() * 5) - 2));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
            {/* 🚨 規約表示 */}
            <div style={{ backgroundColor: '#ff0055', color: '#fff', fontSize: '0.7rem', textAlign: 'center', padding: '5px' }}>
                🔞 18禁：未成年者の利用は固く禁じられています。
            </div>

            {/* 📸 メインビジュアル演出 */}
            <section style={{ position: 'relative', height: '40vh', background: 'linear-gradient(rgba(0,0,0,0.5), #000), url("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80") center/cover' }}>
                <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ width: '12px', height: '12px', backgroundColor: '#00ff00', borderRadius: '50%', boxShadow: '0 0 10px #00ff00' }}></span>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>LIVE: 待機中のキャスト {activeUsers}名</span>
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', lineHeight: '1.2' }}>
                        2秒で繋がる。<br /><span style={{ color: '#ff0055' }}>秘密のビデオチャット</span>
                    </h1>
                </div>
            </section>

            <main style={{ padding: '20px' }}>
                {/* 💬 擬似チャットログ演出 */}
                <div style={{ backgroundColor: '#111', borderRadius: '15px', padding: '15px', border: '1px solid #222', marginBottom: '25px' }}>
                    <p style={{ color: '#ff0055', fontSize: '0.8rem', marginBottom: '10px', fontWeight: 'bold' }}>SYSTEM: 近隣エリアでマッチング中...</p>
                    <div style={{ fontSize: '0.85rem', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p>👤 30秒前: 佐藤さんが通話を開始しました</p>
                        <p>👤 1分前: 20代女性（事務職）がログインしました</p>
                        <p>👤 2分前: 「寂しいから誰か話そ？」と投稿されました</p>
                    </div>
                </div>

                {/* 🚀 メインアクション */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '15px', opacity: 0.8 }}>面倒な入力は一切なし。匿名で即スタート。</p>
                    <a href={LINK_CHAT} target="_blank" style={{ 
                        display: 'block', backgroundColor: '#ff0055', color: '#fff', 
                        padding: '20px', borderRadius: '50px', fontSize: '1.3rem', 
                        fontWeight: '900', textDecoration: 'none', 
                        boxShadow: '0 0 30px rgba(255, 0, 85, 0.5)',
                        animation: 'pulse 2s infinite'
                    }}>
                        今すぐ接続して話す ➔
                    </a>
                    <style>{`
                        @keyframes pulse {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.05); }
                            100% { transform: scale(1); }
                        }
                    `}</style>
                </div>

                {/* 🛡️ メリット訴求 */}
                <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {[
                        { title: '顔出し不要', desc: '音声だけでもOK' },
                        { title: '24h監視', desc: '安心のサポート' },
                        { title: '秘密厳守', desc: '履歴は残りません' },
                        { title: '定額・安心', desc: '高額請求なし' }
                    ].map((item, i) => (
                        <div key={i} style={{ border: '1px solid #333', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#ff0055' }}>{item.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{item.desc}</div>
                        </div>
                    ))}
                </div>
            </main>

            <footer style={{ marginTop: '40px', padding: '20px', textAlign: 'center', fontSize: '0.7rem', color: '#444', borderTop: '1px solid #111' }}>
                © 2026 tiper.live - LiveChat Connection Service<br />
                ※当サイトは広告を含みます。
            </footer>
        </div>
    );
}