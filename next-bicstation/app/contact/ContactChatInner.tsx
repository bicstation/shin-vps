/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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

export default function ContactChatInner() {
    const searchParams = useSearchParams();
    
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'ai', 
            text: '<b>BICSTATIONへようこそ！</b><br />公認コンシェルジュです。ご予算や用途、重視するポイントなど、あなたに最適なPCをご提案します。' 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    
    const messageListRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messageListRef.current) {
            const scrollContainer = messageListRef.current;
            setTimeout(() => {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault(); 
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!response.ok) throw new Error('Communication failed');

            const data = await response.json();

            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: data.text,
                product: data.productName ? {
                    name: data.productName,
                    url: data.productUrl,
                    image: data.productImage || '/images/default-pc.png'
                } : undefined
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: '申し訳ありません。コンシェルジュとの接続が一時的に不安定です。少し時間をおいて再度話しかけてみてください。' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.fullScreenWrapper}>
            <div className={styles.chatContainer}>
                <div className={styles.heroHeader}>
                    <h1>BICSTATION コンシェルジュ相談窓口</h1>
                    <p>AIがあなたに最適なPCをリアルタイムで提案します</p>
                </div>

                <div className={styles.messageList} ref={messageListRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.role === 'user' ? styles.userRow : styles.aiRow}>
                            <img 
                                src={msg.role === 'ai' ? '/images/ai_concierge.png' : '/images/user_icon.png'} 
                                alt="avatar" 
                                className={styles.avatar}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                            />
                            
                            <div className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                                <div dangerouslySetInnerHTML={{ 
                                    __html: msg.text.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
                                }} />

                                {msg.role === 'ai' && msg.product && (
                                    <div className={styles.productCard}>
                                        <img src={msg.product.image} alt={msg.product.name} className={styles.productImage} />
                                        <div className={styles.productInfo}>
                                            <a href={msg.product.url} target="_blank" rel="noopener noreferrer" className={styles.productNameLink}>
                                                {msg.product.name}
                                            </a>
                                            <p className={styles.productDetailBtn}>クリックして詳細を見る</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className={styles.aiRow}>
                            <img src="/images/ai_concierge.png" alt="ai" className={styles.avatar} />
                            <div className={styles.loadingBubble}>
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    )}
                </div>

                <form className={styles.inputSection} onSubmit={handleSend}>
                    <input 
                        type="text" 
                        className={styles.mainInput}
                        placeholder="例：15万円前後で持ち運べる軽いPCを教えて"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className={styles.sendBtn} disabled={isLoading || !input.trim()}>
                        相談する
                    </button>
                </form>
            </div>
        </div>
    );
}