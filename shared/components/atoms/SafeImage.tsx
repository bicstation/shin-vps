/* shared/components/atoms/SafeImage.tsx */
'use client';

import React, { useState, useEffect } from 'react';

interface SafeImageProps {
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
}

export default function SafeImage({ src, alt, className, fallback }: SafeImageProps) {
    // 🌟 デフォルトのフォールバックをテック系のランダム画像に設定
    const [imgSrc, setImgSrc] = useState(src);

    // 親コンポーネントから新しいsrcが渡されたら状態を更新
    useEffect(() => {
        setImgSrc(src);
    }, [src]);

    const handleError = () => {
        if (fallback) {
            setImgSrc(fallback);
        } else {
            // 🌟 フォールバック指定がない場合、Bicstationらしい画像を生成
            // シグネチャに alt を混ぜることで、同じ記事には同じ画像が固定されるようにします
            const techKeywords = ["technology", "cyber", "processor", "ai", "coding"];
            const seed = encodeURIComponent(alt).substring(0, 5);
            const keyword = techKeywords[Math.floor(Math.random() * techKeywords.length)];
            
            setImgSrc(`https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800&sig=${seed}`);
        }
    };

    return (
        <img 
            src={imgSrc || '/no-image.jpg'} 
            alt={alt} 
            className={className} 
            onError={handleError} 
            // 🌟 遅延読み込みを有効にしてパフォーマンス向上
            loading="lazy"
        />
    );
}