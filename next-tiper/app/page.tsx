// ファイル名: C:\dev\SHIN-VPS\next-tiper\app\page.tsx (TOPページ - フルコード)

import Link from 'next/link';
// 💡 作成したクライアントコンポーネントをインポート
import FeaturedCard from './components/FeaturedCard'; 

// TOPページコンポーネント
export default function Home() {

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

  // --- ダミーデータ ---
  const latestPosts = [
    { id: 5, title: '【速報】Django API連携環境構築が完了', category: 'Dev', date: '2025/12/15' },
    { id: 4, title: 'TOPページのレイアウト設計を開始', category: 'Layout', date: '2025/12/15' },
    { id: 3, title: '静的ページ（/about）のルーティング設定', category: 'Dev', date: '2025/12/15' },
    { id: 2, title: 'カテゴリページにサイドバーを実装', category: 'Layout', date: '2025/12/14' },
  ];
  const featuredCategories = [
    { name: 'データ分析', link: '/category/data', color: '#99e0ff' },
    { name: '開発ログ', link: '/category/dev', color: '#e94560' },
    { name: 'マーケティング', link: '/category/marketing', color: '#00d1b2' },
    { name: '技術トレンド', link: '/category/trend', color: '#ffdd57' },
  ];

  return (
    <div style={{ backgroundColor: '#111122', minHeight: '80vh' }}>
      
      {/* ==================================== */}
      {/* 1. ヒーローセクション (サイトのキャッチコピー) */}
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
      {/* 2. ニュースフィード (最新記事リスト) */}
      {/* ==================================== */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>🆕 最新ニュースフィード</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {latestPosts.map(post => (
            <li key={post.id} style={{ 
                padding: '15px 0', 
                borderBottom: '1px dotted #3d3d66',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
              <Link href={`/post/${post.id}`} style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
                {post.title}
              </Link>
              <span style={{ color: '#aaa', fontSize: '0.9em' }}>
                <span style={{ color: '#e94560', marginRight: '10px' }}>[{post.category}]</span> 
                {post.date}
              </span>
            </li>
          ))}
        </ul>
        <div style={{ textAlign: 'right', marginTop: '20px' }}>
             <Link href="/category" style={{ color: '#99e0ff', textDecoration: 'none', fontWeight: 'bold' }}>
                → 全ての記事を見る
            </Link>
        </div>
      </section>
      
      {/* ==================================== */}
      {/* 3. 注目カテゴリ (カード形式) */}
      {/* ==================================== */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>✨ 注目カテゴリ</h2>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {/* 💡 クライアントコンポーネントを使用 */}
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