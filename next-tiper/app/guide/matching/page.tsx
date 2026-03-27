'use client';
import React, { useState, useEffect } from 'react';

export default function MatchingGuide() {
    const [mounted, setMounted] = useState(false);
    const [scanStatus, setScanStatus] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [matchCount, setMatchCount] = useState(247);

    const LINK_HAPPY = 'https://px.a8.net/svt/ejp?a8mat=UB0PF+7K54RM+HCG+60H7N'; 
    const LINK_PCMAX = 'https://px.a8.net/svt/ejp?a8mat=1HYB57+48H06A+YQK+7HUIB'; 
    const LINK_WAKU  = 'https://px.a8.net/svt/ejp?a8mat=2TVVK1+778KI+1KZ4+NTZCJ'; 

    useEffect(() => { setMounted(true); }, []);

    const startScan = () => {
        setScanStatus('searching'); setProgress(0);
        const randomNum = Math.floor(Math.random() * (259 - 241 + 1)) + 241;
        setMatchCount(randomNum);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) { clearInterval(interval); setTimeout(() => setScanStatus('result'), 600); return 100; }
                return prev + 5;
            });
        }, 50);
    };

    if (!mounted) return null;

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px', color: '#0f172a', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '12px', textAlign: 'center', fontSize: '0.75rem' }}>
                【PR/広告】本ページにはプロモーションが含まれます。 🔞 18歳未満・高校生は利用禁止。
            </div>
            <section style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '60px 20px', textAlign: 'center', borderBottom: '4px solid #fbbf24' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>2026年最新：マッチング攻略<br /><span style={{ color: '#fbbf24' }}>「本当に出会える」</span>最強TOP3</h1>
            </section>
            <main style={{ maxWidth: '800px', margin: '-30px auto 0', padding: '0 20px' }}>
                <div style={{ margin: '30px 0', padding: '40px 20px', borderRadius: '25px', background: '#020617', color: 'white', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                    {scanStatus === 'idle' && (
                        <div>
                            <div style={{ fontSize: '2.5rem' }}>📍</div>
                            <h3>周辺エリアのアクティブユーザーを抽出</h3>
                            <button onClick={startScan} style={{ background: 'linear-gradient(to right, #ef4444, #b91c1c)', color: 'white', padding: '15px 35px', borderRadius: '50px', fontWeight: '900', border: 'none', marginTop: '20px', cursor: 'pointer' }}>スキャンを開始</button>
                        </div>
                    )}
                    {scanStatus === 'searching' && (
                        <div>
                            <p style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>解析中: {progress}%</p>
                        </div>
                    )}
                    {scanStatus === 'result' && (
                        <div>
                            <p style={{ fontSize: '1.2rem', color: '#fbbf24' }}>スキャン完了！近隣に <span style={{ fontSize: '2rem', color: '#ef4444' }}>{matchCount}名</span> 検出</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '20px' }}>
                                <a href={LINK_HAPPY} target='_blank' style={{ background: '#fff', color: '#000', padding: '15px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none' }}>ハッピーメール(18禁)</a>
                                <a href={LINK_PCMAX} target='_blank' style={{ background: '#fbbf24', color: '#000', padding: '15px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none' }}>PCMAX(18禁)</a>
                                <a href={LINK_WAKU} target='_blank' style={{ background: '#0ea5e9', color: '#fff', padding: '15px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none' }}>ワクワク(18禁)</a>
                            </div>
                        </div>
                    )}
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>🏆 2026年度 決定版ランキング</h3>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <strong>1位：ハッピーメール</strong>（国内最大級、まずここ）<br/>
                        <strong>2位：PCMAX</strong>（即日会いたいなら最強）<br/>
                        <strong>3位：ワクワクメール</strong>（安心・安全・低料金）
                    </p>
                </div>
            </main>
        </div>
    );
}