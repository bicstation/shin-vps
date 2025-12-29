'use client';

import React, { useState, useEffect } from 'react';

export default function ProductGallery({ images, title }: { images: string[], title: string }) {
  // ステートの初期化を「 images[0] 」で確実に行う
  const [mainImage, setMainImage] = useState<string>('');

  // サーバーからデータが渡ってきた直後にメイン画像をセット
  useEffect(() => {
    if (images && images.length > 0) {
      setMainImage(images[0]);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return <div style={{ color: '#555', padding: '20px' }}>画像がありません</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      {/* メイン画像表示エリア */}
      <div style={{ 
        borderRadius: '15px', 
        overflow: 'hidden', 
        border: '1px solid #3d3d66', 
        backgroundColor: '#1f1f3a',
        aspectRatio: '16/10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '15px'
      }}>
        {mainImage && (
          <img 
            src={mainImage} 
            alt={title} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain'
            }} 
          />
        )}
      </div>

      {/* サブ画像リスト（ギャラリー） */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '10px'
      }}>
        {images.map((img, idx) => (
          <button
            key={`${idx}-${img}`}
            type="button"
            onClick={() => {
              console.log('Clicked image:', img); // デバッグ用：ブラウザのF12で確認
              setMainImage(img);
            }}
            style={{ 
              aspectRatio: '1/1', 
              cursor: 'pointer', 
              borderRadius: '8px', 
              overflow: 'hidden',
              border: mainImage === img ? '2px solid #00d1b2' : '1px solid #3d3d66',
              opacity: mainImage === img ? 1 : 0.6,
              padding: 0,
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <img 
              src={img} 
              alt={`${title} thumb ${idx}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
            />
          </button>
        ))}
      </div>
    </div>
  );
}