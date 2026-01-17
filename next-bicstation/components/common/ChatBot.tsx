'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatBot.module.css';

/**
 * メッセージの型定義
 */
interface Message {
    role: 'user' | 'ai';
    text: string;
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', text: 'こんにちは！BICSTATIONコンシェルジュです。あなたにぴったりのPC探しをお手伝いします。気になることはありますか？' }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    // 最新メッセージへ自動スクロールするための参照
    const scrollEndRef = useRef<HTMLDivElement>(null);

    // メッセージが更新されるたびに最下部へスクロール
    useEffect(() => {
        if (isOpen) {
            scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const toggleChat = () => setIsOpen(!isOpen);

    /**
     * 送信処理 (本物のAPI接続)
     */
    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput(''); // 入力欄を即座にクリア
        
        // ユーザーのメッセージを追加
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // ✅ 重要: TraefikのPathPrefixに合わせて /bicstation を付与
            const response = await fetch('/bicstation/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!response.ok) {
                throw new Error('ネットワークレスポンスが正常ではありませんでした。');
            }

            const data = await response.json();
            
            // Geminiからの回答を画面に追加
            setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: '申し訳ありません。通信エラーが発生しました。しばらく時間を置いてから再度お試しください。' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Enterキーでの送信対応
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* 右下のフローティングボタン */}
            <button 
                className={styles.floatingButton} 
                onClick={toggleChat}
                aria-label="チャット相談を開く"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* チャットウィンドウ */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    {/* ヘッダー */}
                    <div className={styles.chatHeader}>
                        <div className={styles.headerTitle}>
                            <span className={styles.statusDot}>●</span>
                            <span>BICSTATION コンシェルジュ</span>
                        </div>
                        <button onClick={toggleChat} className={styles.headerCloseBtn}>✕</button>
                    </div>
                    
                    {/* メッセージ表示エリア */}
                    <div className={styles.chatBody}>
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={msg.role === 'user' ? styles.userMessageRow : styles.aiMessageRow}
                            >
                                <div className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className={styles.aiMessageRow}>
                                <div className={styles.loadingBubble}>考え中...</div>
                            </div>
                        )}
                        {/* スクロール用ターゲット */}
                        <div ref={scrollEndRef} />
                    </div>

                    {/* 入力エリア */}
                    <div className={styles.chatInputArea}>
                        <input 
                            type="text" 
                            className={styles.inputField} 
                            placeholder="例：10万円以下のPCは？"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <button 
                            className={styles.sendButton} 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                        >
                            送信
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}