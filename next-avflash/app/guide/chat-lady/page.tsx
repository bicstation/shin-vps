'use client';
import React, { useState, useEffect } from 'react';

/**
 * =====================================================================
 * 💌 Madam Live Recruit Guide [Final Fix Version]
 * ---------------------------------------------------------------------
 * エラー回避のため、styled-jsxを廃止し、標準インラインスタイルに統一
 * 案件: マダムライブ (新人ボーナス1万円)
 * =====================================================================
 */
export default function ChatLadyRecruit() {
    const [mounted, setMounted] = useState(false);

    // 🥂 マダムライブ・アフィリエイトリンク
    const AFF_LINK = "https://px.a8.net/svt/ejp?a8mat=203S7V+BSK3MQ+2J9U+BXB8Z";

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div style={{ backgroundColor: '#fffcf9', minHeight: '100vh', color: '#4a4a4a', fontFamily: '"Hiragino Mincho ProN", "serif"', paddingBottom: '100px' }}>
            
            {/* 👑 プレミアム・ヘッダー告知 */}
            <div style={{ 
                backgroundColor: '#8a2387', 
                background: 'linear-gradient(to right, #8a2387, #e94057)', 
                color: '#fff', 
                fontSize: '12px', 
                textAlign: 'center', 
                padding: '12px', 
                fontWeight: 'bold', 
                letterSpacing: '0.1em',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                ✨ 【期間限定】新人ライバー様もれなく全員に 10,000円 ボーナス進呈中！
            </div>

            {/* ✨ Hero Section */}
            <section style={{ 
                position: 'relative', 
                padding: '80px 20px', 
                textAlign: 'center', 
                background: 'linear-gradient(rgba(255,252,249,0.85), rgba(255,252,249,0.95)), url("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80") center/cover',
                borderBottom: '1px solid #f3e5f5'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <p style={{ color: '#e94057', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '15px', letterSpacing: '0.3em' }}>
                        MADAM LIVE OFFICIAL RECRUIT
                    </p>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#333', lineHeight: '1.4', marginBottom: '25px' }}>
                        大人の魅力が、<br />
                        <span style={{ color: '#8a2387' }}>最高の報酬</span>に変わる場所。
                    </h1>
                    <div style={{ display: 'inline-block', backgroundColor: '#fff', padding: '15px 40px', borderRadius: '4px', border: '1px solid #d4af37', boxShadow: '0 10px 30px rgba(212,175,55,0.1)' }}>
                        <p style={{ fontSize: '1rem', color: '#d4af37', fontWeight: 'bold' }}>ノルマなし・24時間いつでも在宅ワーク</p>
                    </div>
                </div>
            </section>

            <main style={{ maxWidth: '750px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* 💎 4つの安心ポイント */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '50px' }}>
                    {[
                        { title: '新人ボーナス1万円', desc: '今なら採用された方全員に、お祝い金10,000円をプレゼント。', icon: '🎁' },
                        { title: '24時間徹底サポート', desc: 'スタッフが常駐。困ったときはいつでも相談できる安心体制。', icon: '📞' },
                        { title: '完全自由シフト', desc: 'ノルマなし。家事の合間や深夜だけなど、好きな時に働けます。', icon: '⏱️' },
                        { title: 'プライバシー厳守', desc: '顔出しなしOK。身バレ防止機能でプライベートも安心。', icon: '🏠' }
                    ].map((item, i) => (
                        <div key={i} style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>{item.icon}</div>
                            <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333', marginBottom: '10px' }}>{item.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* 💬 Q&A Style Section */}
                <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '35px', marginBottom: '50px', borderLeft: '8px solid #8a2387', boxShadow: '0 15px 40px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: '#8a2387', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Q. 未経験でも大丈夫ですか？
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.8' }}>
                        もちろんです。マダムライブでは、<strong>30代〜50代以上の幅広い層の女性</strong>が活躍しています。普段通りの「聞き上手」なあなたであれば、特別なテクニックは必要ありません。
                    </p>
                </div>

                {/* 👩‍💼 Success Stories */}
                <div style={{ marginBottom: '60px' }}>
                    <h3 style={{ textAlign: 'center', color: '#333', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '35px' }}>ライフスタイルに合わせた働き方</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                            { name: '40代・主婦 Aさん', meta: '週3回 / 1日3時間', text: '「扶養内で働きたくて始めました。子供がいない昼間の時間だけで月10万ほど。自分のお小遣いができて嬉しいです。」' },
                            { name: '50代・自営業 Bさん', meta: '週5回 / 夜間のみ', text: '「深夜の空き時間を活用。誰にもバレずに月30万以上の安定収入。サポートの方がとても親切です。」' }
                        ].map((v, i) => (
                            <div key={i} style={{ display: 'flex', gap: '20px', backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #f3e5f5' }}>
                                <div style={{ backgroundColor: '#f3e5f5', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a2387', fontWeight: 'bold', flexShrink: 0 }}>{v.name[0]}</div>
                                <div>
                                    <p style={{ fontSize: '13px', color: '#8a2387', fontWeight: 'bold' }}>{v.name} ({v.meta})</p>
                                    <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '8px', lineHeight: '1.7', fontStyle: 'italic' }}>{v.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🚀 Final CTA: インラインスタイルのみでアニメーション感は省略していますが、最も安全です */}
                <div style={{ 
                    textAlign: 'center', 
                    padding: '50px 30px', 
                    backgroundColor: '#fff', 
                    borderRadius: '30px', 
                    boxShadow: '0 25px 60px rgba(138, 35, 135, 0.12)',
                    border: '1px solid #f3e5f5'
                }}>
                    <p style={{ fontWeight: 'bold', color: '#e94057', marginBottom: '20px', fontSize: '1.2rem' }}>
                        ＼ 新人応援キャンペーン実施中 ／
                    </p>
                    <a href={AFF_LINK} target="_blank" rel="noopener noreferrer" style={{ 
                        display: 'block', 
                        background: 'linear-gradient(135deg, #e94057, #8a2387)', 
                        color: '#fff', 
                        padding: '25px', 
                        borderRadius: '50px', 
                        fontSize: '1.4rem', 
                        fontWeight: 'bold', 
                        textDecoration: 'none',
                        boxShadow: '0 10px 30px rgba(233, 64, 87, 0.4)',
                    }}>
                        ボーナスを受け取って応募する ➔
                    </a>
                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '25px', lineHeight: '1.6' }}>
                        ※登録は完全無料です。18歳以上の女性限定（高校生不可）
                    </p>
                </div>

            </main>

            <footer style={{ textAlign: 'center', padding: '60px 20px', color: '#ccc', fontSize: '10px', letterSpacing: '0.1em' }}>
                © 2026 tiper.live - Madam Live Premier Recruitment Center
            </footer>
        </div>
    );
}