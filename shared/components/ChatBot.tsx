"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatBot.module.css';
// ✅ 常に同じディレクトリ階層にある siteConfig を参照（Dockerfileで置換される）
import { getSiteMetadata } from '../siteConfig';

interface Message {
    role: 'user' | 'ai';
    text: string;
}

export default function ChatBot() {
    // 動的にサイト情報を取得
    const site = getSiteMetadata();
    const siteName = site.site_name || "サイト";

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'ai', 
            text: `こんにちは！${siteName} コンシェルジュです。おすすめの情報や使い方についてお手伝いします。何かお手伝いできることはありますか？` 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // APIルートへのフェッチ（ベースパスを考慮した相対パス）
            const response = await fetch('./api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: '通信エラーが発生しました。' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button className={styles.floatingButton} onClick={toggleChat}>
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <div className={styles.headerTitle}>
                            <span className={styles.statusDot}>●</span>
                            <span>{siteName} コンシェルジュ</span>
                        </div>
                        <button onClick={toggleChat} className={styles.headerCloseBtn}>✕</button>
                    </div>
                    
                    <div className={styles.chatBody}>
                        {messages.map((msg, index) => (
                            <div key={index} className={msg.role === 'user' ? styles.userMessageRow : styles.aiMessageRow}>
                                <div 
                                    className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}
                                    dangerouslySetInnerHTML={{ 
                                        __html: msg.text.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                                    }}
                                />
                            </div>
                        ))}
                        <div ref={scrollEndRef} />
                    </div>

                    <div className={styles.chatInputArea}>
                        <input 
                            className={styles.inputField}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="質問を入力..."
                        />
                        <button className={styles.sendButton} onClick={handleSend} disabled={isLoading}>送信</button>
                    </div>
                </div>
            )}
        </>
    );
}