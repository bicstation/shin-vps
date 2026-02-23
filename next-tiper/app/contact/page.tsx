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
 * 文脈を読み解き、貴方の理想の一人をエスコートします。
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

    // ✅ メッセージ追加時に最下部へ優雅にスクロール
    const scrollToBottom = () => {
        if (messageListRef.current) {
            const scrollContainer = messageListRef.current;
            // 短いラグを設けることでDOM更新後の高さを確実に取得
            setTimeout(() => {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }, 50);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault(); 
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        // APIへ送るための現在の履歴をキャプチャ
        const historyContext = [...messages];

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // ✅ APIエンドポイントへ最新メッセージと履歴を送信
            const response = await fetch('/api/chat', { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    message: userMsg,
                    history: historyContext // これで会話が成立します
                }),
            });

            const contentType = response.headers.get("content-type");
            if (!response.ok || (contentType && contentType.includes("text/html"))) {
                throw new Error("Invalid response from server");
            }

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
                {/* 🥂 ヘッダーエリア：アダルトで高級感のあるデザイン */}
                <div className={styles.heroHeader}>
                    <h1 className="text-xl font-black italic tracking-tighter text-white">ADULT SOMMELIER</h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">tiper.live Premium Concierge</p>
                </div>

                {/* 💬 メッセージ表示エリア */}
                <div className={styles.messageList} ref={messageListRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.role === 'user' ? styles.userRow : styles.aiRow}>
                            <div className={styles.avatarWrapper}>
                                <img 
                                    src={msg.role === 'ai' ? '/images/ai_concierge.png' : '/images/user_icon.png'} 
                                    alt="avatar" 
                                    className={styles.avatar}
                                    onError={(e) => {
                                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%231a237e'/%3E%3C/svg%3E";
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
                                        </div>
                                        <div className={styles.productInfo}>
                                            <a href={msg.product.url} target="_blank" rel="noopener noreferrer" className={styles.productNameLink}>
                                                {msg.product.name}
                                            </a>
                                            <p className={styles.productDetailBtn}>GO TO THE DREAM »</p>
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
                </div>

                {/* ⌨️ 入力エリア：常に最下部に固定 */}
                <form className={styles.inputSection} onSubmit={handleSend}>
                    <input 
                        type="text" 
                        className={styles.mainInput}
                        placeholder={isLoading ? "貴方の理想を吟味しております..." : "こだわりをお聞かせください..."}
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
            </div>
        </div>
    );
}

/**
 * ✅ 最終エクスポート
 */
export default function ContactPage() {
    return (
        <Suspense fallback={
            <div className={styles.fullScreenWrapper}>
                <div className="flex items-center justify-center h-full text-[#c62828] font-mono animate-pulse">
                    PREPARING_GORGEOUS_NIGHT...
                </div>
            </div>
        }>
            <ChatInner />
        </Suspense>
    );
}