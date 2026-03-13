/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import styles from './contact.module.css';

interface Message {
    role: 'user' | 'ai';
    text: string;
    product?: {
        name: string;
        url: string;
        image: string;
    };
}

/**
 * 🥂 AI Sommelier Chat Inner Component
 */
function ChatInner() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'ai', 
            text: '<b>tiper.live へようこそ。私は貴方の専属ソムリエでございます。</b><br />今夜はどのような「夢」をお探しでしょうか？ 貴方の心の奥にある理想を、私にそっとお聞かせください。最高の一人をご案内いたしましょう。' 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    
    const messageListRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    /**
     * ✅ スクロール制御の最適化
     * messagesEndRef への scrollIntoView を使用することで、
     * 要素が追加された直後に確実に最下部へエスコートします。
     */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault(); 
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        const historyContext = [...messages];

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    message: userMsg,
                    history: historyContext
                }),
            });

            if (!response.ok) throw new Error("Connection lost in the night");

            const data = await response.json();

            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: data.text || '申し訳ございません。私の言葉が詰まってしまいました。',
                product: data.productName ? {
                    name: data.productName,
                    url: data.productUrl,
                    image: data.productImage || '/images/default-item.png'
                } : undefined
            }]);
        } catch (error: any) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: '<b>申し訳ございません。</b><br />今夜は少々混み合っているようです。貴方との対話を途切れさせたくはございませんが、少し時間を置いて再度お声がけいただけますか？' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.fullScreenWrapper}>
            <div className={styles.chatContainer}>
                {/* 🥂 BRANDING HEADER */}
                <div className={styles.heroHeader}>
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl font-black italic tracking-tighter text-white drop-shadow-lg">
                            ADULT SOMMELIER
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="h-[1px] w-4 bg-[var(--accent)] opacity-50"></span>
                            <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em]">
                                tiper.live Premium Concierge
                            </p>
                            <span className="h-[1px] w-4 bg-[var(--accent)] opacity-50"></span>
                        </div>
                    </div>
                </div>

                {/* 💬 MESSAGE STREAM */}
                <div className={styles.messageList} ref={messageListRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.role === 'user' ? styles.userRow : styles.aiRow}>
                            <div className={styles.avatarWrapper}>
                                <img 
                                    src={msg.role === 'ai' ? '/images/ai_concierge.png' : '/images/user_icon.png'} 
                                    alt="avatar" 
                                    className={styles.avatar}
                                    onError={(e) => {
                                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23121212'/%3E%3Cpath d='M20 10c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10z' fill='%23333'/%3E%3C/svg%3E";
                                    }}
                                />
                            </div>
                            
                            <div className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                                <div 
                                    className={styles.messageText}
                                    dangerouslySetInnerHTML={{ 
                                        __html: msg.text
                                            .replace(/\n/g, '<br />')
                                            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
                                    }} 
                                />

                                {msg.role === 'ai' && msg.product && (
                                    <div className={styles.productCard}>
                                        <div className={styles.productImageWrapper}>
                                            <img src={msg.product.image} alt={msg.product.name} className={styles.productImage} />
                                            <div className={styles.imageOverlay} />
                                        </div>
                                        <div className={styles.productInfo}>
                                            <p className={styles.recommendLabel}>Special Selection</p>
                                            <a href={msg.product.url} target="_blank" rel="noopener noreferrer" className={styles.productNameLink}>
                                                {msg.product.name}
                                            </a>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-[9px] font-mono text-gray-500 uppercase">Archive ID: TP-{Math.floor(Math.random() * 100000)}</span>
                                                <p className={styles.productDetailBtn}>GO TO DREAM »</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className={styles.aiRow}>
                            <div className={styles.avatarWrapper}>
                                <div className={styles.loadingPulse}></div>
                            </div>
                            <div className={styles.loadingBubble}>
                                <div className={styles.dotFlashing}></div>
                            </div>
                        </div>
                    )}
                    {/* アンカー要素: スクロール位置の基準点 */}
                    <div ref={messagesEndRef} className="h-4 w-full" />
                </div>

                {/* ⌨️ INPUT SECTION */}
                <div className={styles.inputWrapper}>
                    <form className={styles.inputSection} onSubmit={handleSend}>
                        <input 
                            type="text" 
                            className={styles.mainInput}
                            placeholder={isLoading ? "理想のノードを探索中..." : "どのような「こだわり」をお持ちですか？"}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            className={styles.sendBtn} 
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading ? '...' : 'SEND'}
                        </button>
                    </form>
                    <p className="text-[8px] text-center text-gray-600 mt-2 tracking-widest uppercase">
                        Secure Transmission / Adult Concierge Protocol v3.0
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * ✅ EXPORT WITH SUSPENSE
 */
export default function ContactPage() {
    return (
        <Suspense fallback={
            <div className={styles.fullScreenWrapper}>
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-12 h-12 border-t-2 border-[var(--accent)] rounded-full animate-spin"></div>
                    <div className="text-[var(--accent)] font-mono text-xs tracking-[0.5em] animate-pulse">
                        CONNECTING_TO_SOMMELIER...
                    </div>
                </div>
            </div>
        }>
            <ChatInner />
        </Suspense>
    );
}