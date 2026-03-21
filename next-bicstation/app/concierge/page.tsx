/* eslint-disable @next/next/no-img-element */
/**
 * 💬 BICSTATION AIコンシェルジュ・チャットロジック
 * 🛡️ Maya's Logic: ディレクトリ正規化 & Next.js 15 Suspense 対応版
 * 物理パス: /app/concierge/page.tsx
 */

"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * ✅ 修正ポイント: concierge/Contact.module.css を参照
 */
import styles from './Contact.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    product?: {
        name: string;
        url: string;
        image: string;
    };
}

/**
 * 🧱 メインコンポーネント (Next.js 15対応のSuspenseラップ)
 */
export default function ConciergePage() {
    return (
        <Suspense fallback={
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>AIコンシェルジュを起動中...</p>
            </div>
        }>
            <ContactChatInner />
        </Suspense>
    );
}

/**
 * 🧠 チャットロジック本体
 */
function ContactChatInner() {
    const searchParams = useSearchParams();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // ✨ 初期表示: サイトの文脈に合わせた挨拶
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ 
                role: 'assistant', 
                content: '<b>BICSTATION AIコンシェルジュへようこそ。</b><br />あなたに最適なPC環境をご提案します。どのような用途でお探しですか？<br />（例：動画編集用のハイスペックPC、30万円以下のゲーミングノートなど）' 
            }]);
        }
    }, [messages.length]);

    // ✨ スムーズスクロール制御
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsgText = input.trim();
        const userMsg: Message = { role: 'user', content: userMsgText };
        
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsgText,
                    from: searchParams.get('from') || 'direct',
                    context: 'bicstation' // サイト識別用コンテキスト
                }),
            });

            if (!res.ok) throw new Error('Network error');
            
            const data = await res.json();
            const aiReply = data.reply || data.text || '申し訳ありません、回答を生成できませんでした。';

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: aiReply,
                product: data.product 
            }]);
        } catch (e) {
            console.error("Chat Error:", e);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: '⚠️ 接続エラーが発生しました。しばらく時間を置いてから再度お試しください。' 
            }]);
        } finally {
            setIsLoading(false);
            // 送信完了後、即座に入力欄へフォーカスを戻す（UX向上）
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    return (
        <div className={styles.chatWrapper}>
            <div className={styles.chatContainer}>
                {/* --- メッセージリスト --- */}
                <div className={styles.messageList} ref={scrollRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.role === 'user' ? styles.userRow : styles.aiRow}>
                            <div className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                                <div 
                                    className={styles.bubbleText}
                                    dangerouslySetInnerHTML={{ 
                                        __html: msg.content
                                            .replace(/\n/g, '<br />')
                                            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
                                    }} 
                                />
                                
                                {msg.product && (
                                    <div className={styles.productCard}>
                                        <img src={msg.product.image} alt="" className={styles.productImg} />
                                        <div className={styles.productInfo}>
                                            <a href={msg.product.url} target="_blank" rel="noopener noreferrer" className={styles.productLink}>
                                                {msg.product.name}
                                                <span className={styles.externalIcon}>↗</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className={styles.aiRow}>
                            <div className={styles.loadingBubble}>
                                <span className={styles.dot}>●</span>
                                <span className={styles.dot}>●</span>
                                <span className={styles.dot}>●</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- 入力セクション --- */}
                <div className={styles.inputContainer}>
                    <form className={styles.inputSection} onSubmit={handleSend}>
                        <input 
                            ref={inputRef}
                            type="text" 
                            className={styles.mainInput}
                            placeholder="PCの選び方、スペック相談など..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            autoComplete="off"
                        />
                        <button 
                            type="submit" 
                            className={styles.sendBtn}
                            disabled={isLoading || !input.trim()}
                        >
                            <span className={styles.sendIcon}>✈</span>
                        </button>
                    </form>
                    <p className={styles.inputNote}>※AIの回答は必ずしも正確ではない場合があります。</p>
                </div>
            </div>
        </div>
    );
}