'use client';

// 💡 ビルド時の静的解析エラーを回避するための設定
export const dynamic = "force-dynamic";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // 依存関係を明示
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
 * 💡 実際のチャット画面のロジック実体
 */
function ContactChatInner() {
    // ✅ 修正ポイント: useSearchParams を呼び出し、ビルド時の境界を明確にします
    const searchParams = useSearchParams();
    
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'ai', 
            text: '<b>BICSTATIONへようこそ！</b><br />公認コンシェルジュです。ご予算や用途、重視するポイントなど、あなたに最適なPCをご提案します。' 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    
    // スクロール制御用の参照
    const messageListRef = useRef<HTMLDivElement>(null);

    // メッセージ更新時、およびローディング状態の変化時に「リスト内」だけをスクロールさせる
    const scrollToBottom = () => {
        if (messageListRef.current) {
            const scrollContainer = messageListRef.current;
            // 短い遅延を入れることで、DOMの描画完了後にスクロールさせる
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
            // 本番・ローカル両対応のため相対パスを使用
            const response = await fetch('/bicstation/api/chat', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: data.text,
                product: data.productName ? {
                    name: data.productName,
                    url: data.productUrl,
                    image: data.productImage || '/bicstation/images/default-pc.png'
                } : undefined
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'ai', text: '申し訳ありません。コンシェルジュとの通信に失敗しました。時間をおいて再度お試しください。' }]);
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
                                src={msg.role === 'ai' ? '/bicstation/images/ai_concierge.png' : '/bicstation/images/user_icon.png'} 
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
                            <img src="/bicstation/images/ai_concierge.png" alt="ai" className={styles.avatar} />
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
                        placeholder="例：20万円以内で動画編集ができるPCを教えてください"
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

/**
 * ✅ 修正ポイント: ページエントリポイント
 * クライアントコンポーネント内でもさらに Suspense で包むことで、
 * サーバー側での Prerender エラーを二重に防ぎます。
 */
export default function ContactPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                <div className="w-8 h-8 border-t-2 border-slate-500 animate-spin mb-4 rounded-full"></div>
                Initializing Concierge...
            </div>
        }>
            <ContactChatInner />
        </Suspense>
    );
}