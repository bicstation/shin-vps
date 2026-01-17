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
            text: '<b>BICSTATIONへようこそ！</b><br />公認コンシェルジュです。あなたに最適なPCをご提案します。' 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    
    // スクロール制御用の参照
    const scrollEndRef = useRef<HTMLDivElement>(null);
    const messageListRef = useRef<HTMLDivElement>(null);

    // メッセージ更新時に「リスト内」だけをスクロールさせる関数
    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTo({
                top: messageListRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault(); // フォームのデフォルト動作（リロード）を防止
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('/bicstation/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });
            const data = await response.json();

            // AIの回答を追加
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: data.text,
                // APIから商品データが返ってきた場合のみセット
                product: data.productName ? {
                    name: data.productName,
                    url: data.productUrl,
                    image: data.productImage || '/bicstation/images/default-pc.png'
                } : undefined
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: '通信エラーが発生しました。' }]);
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

                {/* メッセージ表示エリア (ここをスクロールさせる) */}
                <div className={styles.messageList} ref={messageListRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.role === 'user' ? styles.userRow : styles.aiRow}>
                            {/* アイコン表示 */}
                            <img 
                                src={msg.role === 'ai' ? '/bicstation/images/ai_concierge.png' : '/bicstation/images/user_icon.png'} 
                                alt="avatar" 
                                className={styles.avatar} 
                            />
                            
                            <div className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                                <div dangerouslySetInnerHTML={{ 
                                    __html: msg.text.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
                                }} />

                                {/* 商品カードの表示 (AIかつ商品データがある場合) */}
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
                    {isLoading && <div className={styles.loading}>コンシェルジュが回答を作成中...</div>}
                    <div ref={scrollEndRef} />
                </div>

                {/* 入力セクション */}
                <form className={styles.inputSection} onSubmit={handleSend}>
                    <input 
                        type="text" 
                        className={styles.mainInput}
                        placeholder="例：動画編集に強いおすすめのPCは？"
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