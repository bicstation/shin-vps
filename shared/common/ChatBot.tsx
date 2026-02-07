'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import styles from './ChatBot.module.css';

interface Message {
    role: 'user' | 'ai';
    text: string;
}

export default function ChatBot() {
    // 💡 URLからサイト設定を判定
    const siteConfig = useMemo(() => {
        if (typeof window === 'undefined') return { name: 'TIPER', api: '/tiper/api/chat', color: '#e94560' };
        const path = window.location.pathname;
        if (path.includes('/bicstation')) {
            return { name: 'BICSTATION', api: '/bicstation/api/chat', color: '#0070f3' };
        } else if (path.includes('/avflash')) {
            return { name: 'AVFLASH', api: '/avflash/api/chat', color: '#ff4757' };
        }
        return { name: 'TIPER', api: '/tiper/api/chat', color: '#e94560' }; // Default
    }, []);

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', text: `Welcome to ${siteConfig.name}. 何かお手伝いできることはありますか？` }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Error: 通信に失敗しました。' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ '--theme-color': siteConfig.color } as React.CSSProperties}>
            <button className={styles.floatingButton} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : <span className={styles.pulseIcon}>💬</span>}
            </button>

            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
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
                                        __html: msg.text.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
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
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className={styles.sendButton} onClick={handleSend} disabled={!input.trim()}>
                            SEND
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}