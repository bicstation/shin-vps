/* eslint-disable @next/next/no-img-element */
/**
 * 💬 BICSTATION AIコンシェルジュ・チャットロジック
 * 🛡️ Maya's Logic: 物理パス修正 & UIインタラクション強化版
 * 物理パス: app/contact/ContactChatInner.tsx
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * ✅ 修正ポイント: 物理ファイル名 /app/contact/Contact.module.css に完全一致
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

export default function ContactChatInner() {
    // 💡 Next.js 15: useSearchParams を使うコンポーネントは親で <Suspense> 必須
    const searchParams = useSearchParams();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 最初の挨拶
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ 
                role: 'assistant', 
                content: '<b>BICSTATION コンシェルジュへようこそ。</b><br />どのようなPCをお探しですか？（例：30万円以下のゲーミングPC、動画編集用ノート等）' 
            }]);
        }
    }, [messages.length]);

    // メッセージ追加時に自動スクロール
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
            // ✅ APIエンドポイント /api/chat (route.ts) へのリクエスト
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsgText,
                    from: searchParams.get('from') || 'direct'
                }),
            });

            if (!res.ok) throw new Error('Network error');
            
            const data = await res.json();
            
            // API側から data.reply または data.text が返る想定
            const aiReply = data.reply || data.text || '回答を取得できませんでした。';

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: aiReply,
                // もしAPIが製品データを返してくる場合の拡張性
                product: data.product 
            }]);
        } catch (e) {
            console.error("Chat Error:", e);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: '申し訳ありません。接続エラーが発生しました。時間を置いて再度お試しください。' 
            }]);
        } finally {
            setIsLoading(false);
            // 入力欄にフォーカスを戻す
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    return (
        <div className={styles.chatContainer}>
            {/* メッセージ表示エリア */}
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
                            
                            {/* 製品提案がある場合の表示カード */}
                            {msg.product && (
                                <div className={styles.productCard}>
                                    <img src={msg.product.image} alt="" className={styles.productImg} />
                                    <div className={styles.productInfo}>
                                        <a href={msg.product.url} target="_blank" rel="noopener noreferrer">
                                            {msg.product.name}
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
                            <span>●</span><span>●</span><span>●</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 入力フォームエリア */}
            <form className={styles.inputSection} onSubmit={handleSend}>
                <input 
                    ref={inputRef}
                    type="text" 
                    className={styles.mainInput}
                    placeholder="相談内容を入力..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    className={styles.sendBtn}
                    disabled={isLoading || !input.trim()}
                >
                    送信
                </button>
            </form>
        </div>
    );
}