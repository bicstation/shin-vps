// ファイル名: C:\dev\SHIN-VPS\next-tiper\app\components\FeaturedCard.tsx

"use client"; // 💡 これが重要！インタラクティブな動作を許可

import Link from 'next/link';
import React from 'react';

interface FeaturedCardProps {
    name: string;
    link: string;
    color: string;
}

export default function FeaturedCard({ name, link, color }: FeaturedCardProps) {
    const cardStyle: React.CSSProperties = {
        flex: '1 1 200px',
        minWidth: '200px',
        padding: '25px',
        textAlign: 'center',
        backgroundColor: '#1f1f3a',
        borderRadius: '8px',
        textDecoration: 'none',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
        transition: 'transform 0.2s',
        display: 'block', // Linkタグをブロック要素にする
    };

    // マウスホバーイベントハンドラーをクライアントコンポーネント内で適用
    return (
        <Link 
            href={link} 
            style={cardStyle}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <h3 style={{ margin: 0, color: color, fontSize: '1.4em' }}>
                {name}
            </h3>
            <p style={{ color: '#ccc', fontSize: '0.9em', marginTop: '10px' }}>
                関連情報へ移動
            </p>
        </Link>
    );
}