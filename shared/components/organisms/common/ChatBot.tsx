'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * ✅ 修正: 物理パス準拠
 */
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import styles from './ChatBot.module.css';

interface Message {
    role: 'user' | 'ai';
    text: string;
}

/**
 * =====================================================================
 * 🛡️ Maya's Logic: ハイブリッド・アイデンティティ対応チャットボット
 * ---------------------------------------------------------------------
 * 修正ポイント:
 * 1. SSR時も環境変数から site を確定させ、ログの undefined を根絶。
 * 2. 最初の挨拶メッセージ生成を SSR と Client で一致させ、整合性を保持。
 * =====================================================================
 */
export default function ChatBot() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    // 🛰️ サイト設定の動的取得 (SSR & Client 両対応)
    const site = useMemo(() => {
        // 1. サーバーなら環境変数、ブラウザなら hostname を参照
        const identifier = typeof window !== 'undefined' 
            ? window.location.hostname 
            : process.env.NEXT_PUBLIC_SITE_DOMAIN;

        return getSiteMetadata(identifier || "");
    }, []);

    // ✅ テーマカラーとAPI設定の算出
    const siteConfig = useMemo(() => {
        if (!site) return { name: 'CONCIERGE', api: '/api/chat', color: '#333' };
        
        const themeColor = getSiteColor(site.site_name);
        const apiPath = `${site.site_prefix || ''}/api/chat`;
        
        return { 
            name: site.site_name.toUpperCase(), 
            api: apiPath, 
            color: themeColor 
        };
    }, [site]);

    // ✨ 最初の挨拶 (SSR時にも一貫性を保つため mounted を条件から外す、または site 確定に合わせる)
    useEffect(() => {
        if (site && messages.length === 0) {
            const botName = site.site_group === 'adult' ? 'AIソムリエ' : 'AIコンシェルジュ';
            setMessages([
                { role: 'ai', text: `<b>${siteConfig.name} ${botName}</b>へようこそ。何かお手伝いできることはありますか？` }
            ]);
        }
    }, [site, siteConfig.name, messages.length]);

    // ✅ 初回マウント確認
    useEffect(() => {
        setMounted(true);
    }, []);

    // ✨ メッセージ追加時の自動スクロール
    useEffect(() => {
        if (isOpen) {
            scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch(siteConfig.api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsg,
                    context: 'floating_chat'
                }),
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const aiText = data.reply || data.text || '申し訳ありません、うまく聞き取れませんでした。';
            
            setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: '⚠️ 現在、通信エラーが発生しています。時間を置いて再度お試しください。' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // 🚩 サイト情報が確定できない場合のみガード
    if (!site) return null;

    return (
        <div 
            className={styles.chatWrapper}
            style={{ '--theme-color': siteConfig.color } as React.CSSProperties}
        >
            {/* --- フローティング起動ボタン --- */}
            <button 
                className={`${styles.floatingButton} ${isOpen ? styles.btnActive : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="チャットを開く"
                style={{ backgroundColor: siteConfig.color }}
            >
                {isOpen ? '✕' : <span className={styles.pulseIcon}>💬</span>}
            </button>

            {/* --- チャットウィンドウ --- */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader} style={{ background: siteConfig.color }}>
                        <div className={styles.headerTitle}>
                            <div className={styles.statusLamp} />
                            <span>{siteConfig.name} Concierge</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className={styles.headerCloseBtn}>✕</button>
                    </div>
                    
                    <div className={styles.chatBody}>
                        {messages.map((msg, index) => (
                            <div key={index} className={msg.role === 'user' ? styles.userRow : styles.aiRow}>
                                <div 
                                    className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}
                                    dangerouslySetInnerHTML={{ 
                                        __html: msg.text
                                            .replace(/\n/g, '<br />')
                                            .replace(/\*\?(.*?)\*\*/g, '<b>$1</b>')
                                    }}
                                />
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className={styles.aiRow}>
                                <div className={styles.loadingBubble}>
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={scrollEndRef} />
                    </div>

                    <div className={styles.chatInputArea}>
                        <input 
                            className={styles.inputField} 
                            placeholder="知りたいことを入力..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            disabled={isLoading}
                        />
                        <button 
                            className={styles.sendButton} 
                            onClick={handleSend} 
                            disabled={!input.trim() || isLoading}
                            style={{ color: siteConfig.color }}
                        >
                            送信
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}