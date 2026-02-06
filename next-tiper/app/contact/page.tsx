'use client';

import React, { useState, useRef, useEffect } from 'react';
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

export default function ContactPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'ai', 
            text: '<b>tiper.live AIコンシェルジュへようこそ！</b><br />ご予算や用途、重視するポイントなど、あなたに最適なコンテンツやデバイスをご提案します。' 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    
    const messageListRef = useRef<HTMLDivElement>(null);

    // ✅ リスト内を自動スクロールさせる
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
            // ✅ APIエンドポイントはプロジェクトの設定に合わせて調整してください
            // HTMLが返ってくるのを防ぐため、Acceptヘッダーを明示
            const response = await fetch('/api/chat', { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ message: userMsg }),
            });

            // ✅ 先ほどのエラー対策：JSONでない（HTMLが返ってきた）場合の処理
            const contentType = response.headers.get("content-type");
            if (!response.ok || (contentType && contentType.includes("text/html"))) {
                throw new Error("Invalid response from server (HTML instead of JSON)");
            }

            const data = await response.json();

            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: data.text || '申し訳ありません、回答を生成できませんでした。',
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
                text: '<b>通信エラーが発生しました</b><br />現在コンシェルジュが混み合っているか、サーバーとの接続に問題があります。しばらくしてから再度お試しください。' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.fullScreenWrapper}>
            <div className={styles.chatContainer}>
                {/* ヘッダーエリア */}
                <div className={styles.heroHeader}>
                    <h1 className="text-xl font-black italic tracking-tighter text-white">AI CONCIERGE</h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Real-time Smart Assistant</p>
                </div>

                {/* メッセージ表示エリア */}
                <div className={styles.messageList} ref={messageListRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.role === 'user' ? styles.userRow : styles.aiRow}>
                            <div className={styles.avatarWrapper}>
                                <img 
                                    src={msg.role === 'ai' ? '/images/ai_concierge.png' : '/images/user_icon.png'} 
                                    alt="avatar" 
                                    className={styles.avatar}
                                    onError={(e) => {
                                        // 画像がない場合はイニシャルを表示するなどのフォールバック
                                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23222244'/%3E%3C/svg%3E";
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
                                            <p className={styles.productDetailBtn}>VIEW DETAILS »</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {/* ローディングアニメーション */}
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

                {/* 入力エリア */}
                <form className={styles.inputSection} onSubmit={handleSend}>
                    <input 
                        type="text" 
                        className={styles.mainInput}
                        placeholder="知りたいことを入力してください..."
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