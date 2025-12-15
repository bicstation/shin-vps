// ファイル名: C:\dev\SHIN-VPS\next-tiper\app\category\page.tsx

import CategoryLayout from '../components/CategoryLayout'; // 作成したレイアウトをインポート
import Link from 'next/link';

// カテゴリページのメタデータ
export const metadata = {
    title: 'カテゴリ一覧 | Tiper Live',
    description: '記事のカテゴリ一覧ページです。',
};

// カテゴリのトップページ
export default function CategoryPage() {
  return (
    <CategoryLayout>
        {/* CategoryLayout の children として渡される内容 */}
        <h2 style={{ color: '#e94560', borderBottom: '2px solid #3d3d66', paddingBottom: '10px' }}>
            記事カテゴリのトップ
        </h2>
        <p style={{ color: '#ccc', fontSize: '1.1em' }}>
            サイドバーが適用されました。ここはカテゴリ一覧や最新記事が表示されるエリアです。
        </p>
        
        {/* 個別ページへのダミーリンク */}
        <div style={{ marginTop: '20px' }}>
            <Link href="/post/1" style={{ color: '#99e0ff', textDecoration: 'none', fontWeight: 'bold' }}>
                → 個別記事ページへ移動 (次のステップで作成)
            </Link>
        </div>
    </CategoryLayout>
  );
}