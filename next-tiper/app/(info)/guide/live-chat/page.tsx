// app/guide/live-chat/page.tsx (予定)

'use client';

import React, { useState, useEffect } from 'react';

export default function LiveChatGuide() {
    const [status, setStatus] = useState('OFFLINE');
    const [streams, setStreams] = useState(0);

    useEffect(() => {
        // 信号傍受の演出用
        setTimeout(() => setStatus('INTERCEPTING...'), 1000);
        setTimeout(() => {
            setStatus('ONLINE / DECRYPTED');
            setStreams(12408); // 配信中の架空の数
        }, 3000);
    }, []);

    return (
        <div style={{ backgroundColor: '#050505', color: '#00ff41', minHeight: '100vh', fontFamily: 'monospace' }}>
            {/* 📡 ヘッダー：信号傍受中 */}
            <div style={{ borderBottom: '1px solid #00ff41', padding: '20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', textShadow: '0 0 10px #00ff41' }}>
                    [ SIGNAL_SOURCE: GLOBAL_LIVE_STREAM ]
                </h1>
                <p style={{ fontSize: '0.8rem' }}>STATUS: {status}</p>
            </div>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* 📺 ライブプレビュー風セクション */}
                <div style={{ background: '#111', padding: '30px', borderRadius: '10px', border: '1px solid #333', textAlign: 'center' }}>
                    <div style={{ color: '#ff0000', fontWeight: 'bold', marginBottom: '10px' }}>● LIVE NOW</div>
                    <p style={{ fontSize: '1.2rem', color: '#fff' }}>
                        現在世界中で <span style={{ fontSize: '2rem', color: '#00ff41' }}>{streams}</span> の配信を確認。
                    </p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>※VPN不要・無修正・即時視聴可能</p>
                </div>

                {/* 🏆 ライブチャットTOP3ランキング */}
                <div style={{ marginTop: '40px' }}>
                    {/* 1位: Stripchat (海外・無修正の王者) */}
                    <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #fbbf24', borderRadius: '15px', background: 'rgba(251, 191, 36, 0.05)' }}>
                        <h2 style={{ color: '#fbbf24' }}>🥇 Stripchat [Global/Uncensored]</h2>
                        <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '10px 0' }}>世界的人気の黒船サイト。驚異の無修正ライブ。VR対応モデルも多数。</p>
                        <a href="https://ja.stripchat.com/" style={{ color: '#fbbf24', fontWeight: 'bold' }}>⚡ 信号を傍受する（無料登録）</a>
                    </div>

                    {/* 2位: FANZA (国内の安定) */}
                    <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #fff', borderRadius: '15px' }}>
                        <h2 style={{ color: '#fff' }}>🥈 FANZA Live Chat [Domestic]</h2>
                        <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '10px 0' }}>国内最大級。日本語で楽しめる安心感。DMMアカウントで即開始可能。</p>
                        <a href="#" style={{ color: '#fff', fontWeight: 'bold' }}>🔗 メインフレームへ接続</a>
                    </div>
                </div>
            </main>
        </div>
    );
}