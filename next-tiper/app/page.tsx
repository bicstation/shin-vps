// ファイル名: C:\dev\SHIN-VPS\next-tiper\app\page.tsx (最終版)

import React from 'react';
import Link from 'next/link'; // layout.tsxから移動しても問題ないですが、ここでは残します

// Pageファイルは async Server Component にします
export default async function Page() {
    
    // 💡 修正: 環境変数からタイトルを取得
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'デモタイトルが見つかりません';

    return (
        // layout.tsx の <main> の中に入るコンテンツ
        <div style={{ padding: '0px' }}>

            {/* 🚀 デプロイ成功確認用ブロック (目立つように赤色で強調) */}
            <div style={{ 
                backgroundColor: '#3a1f1f', // 暗めの赤背景で警告/成功を強調
                padding: '30px', 
                marginBottom: '30px',
                borderRadius: '8px', 
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
                border: '1px solid #e94560'
            }}>
                <h2 style={{ 
                    color: '#e94560', 
                    fontSize: '2.5em', 
                    margin: '0 0 10px 0',
                    textShadow: '0 0 8px rgba(233, 69, 96, 0.9)' // ネオン風
                }}>
                    ✅ デプロイ成功確認済み v2.0
                </h2>
                <p style={{ 
                    fontSize: '1.2em', 
                    color: '#ffffff', 
                    margin: 0 
                }}>
                    この変更がVPSのステージング環境に反映されました！GitHub Actions フローは安定しています。
                </p>
            </div>
            
            {/* ------------------------------------------------------------- */}
            {/* 既存のコンテンツエリア */}
            {/* ------------------------------------------------------------- */}

            <h2 style={{ color: '#99e0ff', borderBottom: '1px solid #3d3d66', paddingBottom: '10px' }}>
                メインコンテンツエリア
            </h2>
            <p style={{ color: '#ccc' }}>
                このエリアは、<strong style={{color: '#fff'}}>{title}</strong> の固有のロジックやデータを表示します。
            </p>
            
            {/* 💡 修正: Linkコンポーネントはレイアウト側にあるため、ここでは単なるデモリンクに戻します */}
            <div style={{ marginTop: '15px' }}>
                <p style={{ color: '#fff' }}>リンクデモ:</p>
                <Link href="/tiper/" style={{ textDecoration: 'none', color: '#99e0ff', display: 'block', padding: '5px 0' }}>Tiperトップへ</Link>
                <Link href="/saving/" style={{ textDecoration: 'none', color: '#99e0ff', display: 'block', padding: '5px 0' }}>Savingへ</Link>
            </div>
            
            <div style={{ background: '#2b2b4d', padding: '15px', border: '1px solid #3d3d66', borderRadius: '5px', marginTop: '20px' }}>
                <p style={{ margin: 0 }}>ここに複雑なUIコンポーネントや動的なデータが表示されます。</p>
                <p style={{ fontStyle: 'italic', color: '#aaa', margin: '5px 0 0 0' }}>Next.jsコンテナ: {title} (App Router)</p>
            </div>
        </div>
    );
};