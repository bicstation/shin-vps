/* shared/components/atoms/SafeImage.tsx */
'use client';

import React, { useState, useEffect } from 'react';

interface SafeImageProps {
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
}

/**
 * 🛡️ SafeImage: 画像の読み込み失敗を検知し、自動でテック系の代替画像に切り替える
 */
export default function SafeImage({ src, alt, className, fallback }: SafeImageProps) {
    // 初期状態として渡されたsrcをセット
    const [imgSrc, setImgSrc] = useState<string>(src);
    // すでに代替画像に切り替え済みかどうかのフラグ（無限ループ防止）
    const [isFallback, setIsFallback] = useState<boolean>(false);

    // 親コンポーネントから新しいsrcが渡されたら状態をリセット
    useEffect(() => {
        setImgSrc(src);
        setIsFallback(false);
    }, [src]);

    const handleError = () => {
        // すでに代替表示中なら何もしない
        if (isFallback) return;

        if (fallback) {
            setImgSrc(fallback);
        } else {
            /**
             * 🌟 Bicstation専用のバックアップ画像ロジック
             * Unsplashの高品質なテック画像を使用。
             * alt（記事タイトル）からシード値を生成し、記事ごとに画像が固定されるようにします。
             */
            const seed = encodeURIComponent(alt).substring(0, 8);
            const backupUrl = `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800&sig=${seed}`;
            
            setImgSrc(backupUrl);
        }
        setIsFallback(true);
    };

    return (
        <img 
            src={imgSrc || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'} 
            alt={alt} 
            className={className} 
            onError={handleError} 
            /**
             * 🌟 403エラー対策の重要オプション
             * referrerPolicy="no-referrer" を指定することで、
             * 相手サーバーに「どこから画像を取得しようとしているか」を伝えず、
             * 直リンク禁止ガードを回避できる確率を大幅に上げます。
             */
            referrerPolicy="no-referrer"
            loading="lazy"
        />
    );
}