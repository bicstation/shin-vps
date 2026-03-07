// /home/maya/shin-dev/shin-vps/shared/components/organisms/common/ChatBot.tsx
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
/**
 * ✅ 修正: 物理パスに合わせて lib/ を追加
 * 物理パス: shared/lib/utils/siteConfig.ts
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/utils/siteConfig';
import styles from './ChatBot.module.css';

interface Message {
    role: 'user' | 'ai';
    text: string;
}

export default function ChatBot() {
    /**
     * ✅ クライアントサイドでの実行を考慮し、
     * window.location.host をフォールバックとして使用
     */
    const site = useMemo(() => {
        const host = typeof window !== 'undefined' ? window.location.host : '';
        return getSiteMetadata(host);
    }, []);

    const themeColor = useMemo(() => getSiteColor(site.site_name), [site]);

    // 💡 環境に応じたAPIエンドポイントの解決
    const siteConfig = useMemo(() => {
        // App Router環境下で確実に /api/chat を叩くためのパス構築
        const apiPath = `${site.site_prefix || ''}/api/chat`;
        
        return { 
            name: site.site_name.toUpperCase(), 
            api: apiPath, 
            color: themeColor 
        };
    }, [site, themeColor]);

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', text: `Welcome to ${siteConfig.name}. 何かお手伝いできることはありますか？` }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    // スムーススクロールの最適化
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [messages, isOpen]);

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
                body: JSON.stringify({ message: userMsg }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: '申し訳ありません。現在コンシェルジュが席を外しております。後ほどお試しください。' }]);
        } finally {
            setIsLoading(true); // 実際には false に戻すべきですが、元コードのロジックを維持しつつ修正
            setIsLoading(false);
        }
    };

    return (
        <div style={{ '--theme-color': siteConfig.color } as React.CSSProperties}>
            <button 
                className={styles.floatingButton} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open Chatbot"
            >
                {isOpen ? '✕' : <span className={styles.pulseIcon}>💬</span>}
            </button>

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
                                        // Markdownライクな強調と改行のパース
                                        __html: msg.text
                                            .replace(/\n/g, '<br />')
                                            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
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
                            placeholder="メッセージを入力..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
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