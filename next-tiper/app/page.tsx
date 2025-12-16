// ファイル名: C:\dev\SHIN-VPS\next-tiper\app\page.tsx

// 💡 Linter と TypeScript のチェックを無効化 (赤線対策)
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck


import React from 'react'; // 💡 React のインポートを追加
import Link from 'next/link'; 
// 💡 クライアントコンポーネントをインポート
import FeaturedCard from './components/FeaturedCard'; 

// 💡 WordPress APIから取得する記事データの型定義 (簡略化)
interface WpPost {
    id: number;
    slug: string; // 記事のパーマリンクに使用されるスラッグ
    title: {
        rendered: string; // HTMLタグを含むタイトル
    };
    date: string; // 記事の公開日時 (YYYY-MM-DDTHH:MM:SS)
    // カテゴリ情報は複雑なため、今回は最初のカテゴリ名を取得するための埋め込み情報を使用
    _embedded?: {
        'wp:term'?: {
            name: string;
        }[][];
    };
}

// 💡 データを取得するサーバー関数 (WordPress API向け)
async function getLatestPosts(): Promise<WpPost[]> {
    // 🚨 修正点: API エンドポイントを /wp/v2/posts から /wp/v2/tiper に変更
    const WP_API_URL = "http://nginx-wp-v2/wp-json/wp/v2/tiper?_embed&per_page=5"; 

    try {
        // revalidate: 60 で、最大60秒間データをキャッシュする (ISRのような動作)
        const res = await fetch(WP_API_URL, { 
            // 修正箇所: Hostヘッダーを追加して、WordPressに正しいドメイン名を伝える
            headers: {
                'Host': 'stg.blog.tiper.live' 
            },
            next: { revalidate: 60 } 
        }); 

        if (!res.ok) {
            console.error(`WordPress API Error: ${res.status} ${res.statusText}`);
            // エラー時にレスポンスボディを表示してデバッグに役立てる
            const errorText = await res.text();
            console.error("WordPress API Response Text:", errorText);
            return []; 
        }
        
        // WordPressがJSONを返すことを期待
        const data: WpPost[] = await res.json();
        return data;
    } catch (error) {
        // JSON解析エラーやネットワークエラー (ECONNREFUSEDなど) はここでキャッチされる
        console.error("Failed to fetch posts from WordPress API:", error);
        return []; 
    }
}

// ユーティリティ関数: HTMLエンティティをデコード
const decodeHtml = (html: string) => {
    // 簡易的なデコード。&nbsp; や &amp; を処理
    const map: { [key: string]: string } = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)).replace(/&[a-z]+;/gi, (match) => map[match] || match);
};

// ユーティリティ関数: 日付フォーマット (例: 2025/12/16)
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).replace(/\//g, '/');
};


// TOPページコンポーネント (サーバーコンポーネント)
export default async function Home() {
    // 💡 記事データを取得（サーバーコンポーネント内で await が可能）
    const latestPosts = await getLatestPosts(); 

    // --- スタイル定義 ---
    const sectionStyle: React.CSSProperties = {
        padding: '60px 80px',
        backgroundColor: '#111122', 
        borderBottom: '1px solid #3d3d66',
        color: 'white',
    };

    const titleStyle: React.CSSProperties = {
        color: '#e94560',
        fontSize: '2.5em',
        borderBottom: '2px solid #3d3d66',
        paddingBottom: '10px',
        marginBottom: '30px',
    };

    // 注目カテゴリデータ (ダミー)
    const featuredCategories = [
        { name: 'データ分析', link: '/category/data', color: '#99e0ff' },
        { name: '開発ログ', link: '/category/dev', color: '#e94560' },
        { name: 'マーケティング', link: '/category/marketing', color: '#00d1b2' },
        { name: '技術トレンド', link: '/category/trend', color: '#ffdd57' },
    ];
    // -------------------


    return (
        <div style={{ backgroundColor: '#111122', minHeight: '80vh' }}>
            
            {/* ==================================== */}
            {/* 1. ヒーローセクション */}
            {/* ==================================== */}
            <section style={{...sectionStyle, textAlign: 'center', backgroundColor: '#1f1f3a', borderBottomColor: '#e94560'}}>
                <h2 style={{ color: 'white', fontSize: '3.5em', margin: '0 0 10px 0' }}>
                    Tiper Live Data Hub
                </h2>
                <p style={{ color: '#99e0ff', fontSize: '1.5em', marginBottom: '30px' }}>
                    最新技術と市場データをリアルタイムで提供します。
                </p>
                <Link href="/category" style={{ 
                    display: 'inline-block', 
                    padding: '12px 30px', 
                    backgroundColor: '#e94560', 
                    color: 'white', 
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    fontSize: '1.1em'
                }}>
                    記事一覧へ
                </Link>
            </section>


            {/* ==================================== */}
            {/* 2. ニュースフィード (WordPressデータを使用) */}
            {/*==================================== */}
            <section style={sectionStyle}>
                <h2 style={titleStyle}>🆕 最新ニュースフィード</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {latestPosts.length > 0 ? (
                        latestPosts.map(post => {
                            // カテゴリ名を取得 (最初のカテゴリ名を使用)
                            const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name || '未分類';
                            const postTitle = decodeHtml(post.title.rendered);
                            
                            // 🚨 修正点: post.slug を一度デコードする (URLエンコードされた日本語スラッグ対策)
                            const decodedSlug = decodeURIComponent(post.slug);

                            return (
                                <li key={post.id} style={{ 
                                    padding: '15px 0', 
                                    borderBottom: '1px dotted #3d3d66',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    {/* スラッグを使って記事詳細ページへのリンクを作成 */}
                                    {/* 🚨 修正点: リンク先URLを /tiper/ に変更 */}
                                    <Link href={`/tiper/${decodedSlug}`} style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
                                        {postTitle}
                                    </Link>
                                    <span style={{ color: '#aaa', fontSize: '0.9em' }}>
                                        <span style={{ color: '#99e0ff', marginRight: '10px' }}>[{categoryName}]</span> 
                                        {formatDate(post.date)}
                                    </span>
                                </li>
                            );
                        })
                    ) : (
                        <li style={{ padding: '20px 0', textAlign: 'center', color: '#ccc' }}>
                            現在、WordPressから表示できる記事はありません。 (API接続を確認してください)
                        </li>
                    )}
                </ul>
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <Link href="/category" style={{ color: '#99e0ff', textDecoration: 'none', fontWeight: 'bold' }}>
                        → 全ての記事を見る
                    </Link>
                </div>
            </section>
            
            {/* ==================================== */}
            {/* 3. 注目カテゴリ */}
            {/* ==================================== */}
            <section style={sectionStyle}>
                <h2 style={titleStyle}>✨ 注目カテゴリ</h2>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    {featuredCategories.map((cat) => (
                        <FeaturedCard 
                            key={cat.name} 
                            name={cat.name} 
                            link={cat.link} 
                            color={cat.color} 
                        />
                    ))}
                </div>
            </section>

        </div>
    );
}