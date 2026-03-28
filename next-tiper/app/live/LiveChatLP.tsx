'use client';
import React, { useState, useEffect } from 'react';

export default function LiveChatLP() {
    const [mounted, setMounted] = useState(false);
    const [activeUsers, setActiveUsers] = useState(15);
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState({ name: '', action: '' });

    // 🔗 ライブでゴーゴー（A8.net）アフィリエイトリンク
    const LINK_CHAT = "https://px.a8.net/svt/ejp?a8mat=OET7H+CC7ELE+BM2+BYT9F";

    const notifications = [
        { name: '22歳・事務職（東京都）', action: 'が通話を開始しました' },
        { name: '24歳・ショップ店員', action: 'が今すぐ通話OKに設定しました' },
        { name: '30代・既婚女性', action: 'がシークレットで待機中' },
        { name: '21歳・女子大生', action: 'と5分間のビデオ通話が成立' },
        { name: '匿名ユーザー', action: 'が「寂しいから誰か話そ？」と投稿' }
    ];

    useEffect(() => {
        setMounted(true);
        const userInterval = setInterval(() => {
            setActiveUsers(prev => Math.max(10, prev + Math.floor(Math.random() * 6) - 2));
        }, 3500);

        const triggerPopup = () => {
            const randomData = notifications[Math.floor(Math.random() * notifications.length)];
            setPopupContent(randomData);
            setShowPopup(true);
            setTimeout(() => {
                setShowPopup(false);
                setTimeout(triggerPopup, Math.random() * 5000 + 8000);
            }, 5000);
        };

        const firstPopupTimer = setTimeout(triggerPopup, 4000);
        return () => { clearInterval(userInterval); clearTimeout(firstPopupTimer); };
    }, []);

    if (!mounted) return null;

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', overflowX: 'hidden' }}>
            <div style={{ backgroundColor: '#ff0055', color: '#fff', fontSize: '11px', textAlign: 'center', padding: '6px', fontWeight: 'bold' }}>
                🔞 18歳未満・高校生は利用禁止。匿名で24時間接続可能。
            </div>

            <section style={{ position: 'relative', height: '42vh', background: 'linear-gradient(rgba(0,0,0,0.4), #000), url("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80") center/cover' }}>
                <div style={{ position: 'absolute', bottom: '25px', left: '20px', right: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#00ff00', borderRadius: '50%', boxShadow: '0 0 10px #00ff00' }}></span>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>LIVE: 待機中の女性 {activeUsers}名</span>
                    </div>
                    <h1 style={{ fontSize: '2.1rem', fontWeight: '900', lineHeight: '1.2' }}>
                        2秒で繋がる。<br /><span style={{ color: '#ff0055' }}>大人の秘密通話</span>
                    </h1>
                </div>
            </section>

            <main style={{ padding: '20px' }}>
                <div style={{ backgroundColor: '#0a0a0a', borderRadius: '20px', padding: '15px', border: '1px solid #1a1a1a', marginBottom: '30px' }}>
                    <p style={{ color: '#ff0055', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>📡 ライブでゴーゴー：サーバー接続済み</p>
                    <div style={{ fontSize: '13px', color: '#888', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p>✓ 匿名通話・顔出しなし設定可能</p>
                        <p>✓ 登録無料・お試しポイント配布中</p>
                        <p>✓ 秘密厳守・履歴は一切残りません</p>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <a href={LINK_CHAT} target="_blank" style={{ 
                        display: 'block', background: 'linear-gradient(135deg, #ff0055 0%, #d40046 100%)', color: '#fff', 
                        padding: '22px', borderRadius: '50px', fontSize: '1.4rem', 
                        fontWeight: '900', textDecoration: 'none', 
                        boxShadow: '0 10px 40px rgba(255, 0, 85, 0.4)',
                        animation: 'pulse 2s infinite'
                    }}>
                        今すぐ匿名で接続する ➔
                    </a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[{t:'顔出し不要', d:'声だけでOK'}, {t:'24h監視', d:'安全安心'}, {t:'即接続', d:'待機なし'}, {t:'秘密厳守', d:'匿名100%'}].map((v, i) => (
                        <div key={i} style={{ backgroundColor: '#0a0a0a', border: '1px solid #222', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#ff0055' }}>{v.t}</div>
                            <div style={{ fontSize: '11px', color: '#666' }}>{v.d}</div>
                        </div>
                    ))}
                </div>
            </main>

            {/* 🔔 浮遊ポップアップ */}
            <div style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', zIndex: 1000, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#000', padding: '12px 18px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                    transform: showPopup ? 'translateY(0)' : 'translateY(150px)', opacity: showPopup ? 1 : 0, transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)', maxWidth: '380px', width: '100%'
                }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{popupContent.name}</div>
                        <div style={{ fontSize: '11px', color: '#555' }}>{popupContent.action}</div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.03); }
                    100% { transform: scale(1); }
                }
            `}</style>

            <footer style={{ padding: '40px 20px', textAlign: 'center', fontSize: '10px', color: '#444' }}>
                © 2026 tiper.live | Live Connection Platform<br />
                ※当ページはアフィリエイト広告を利用しています。
            </footer>
        </div>
    );
}