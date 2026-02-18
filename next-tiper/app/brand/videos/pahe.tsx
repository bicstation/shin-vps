/* /app/videos/page.tsx */
import React from 'react';
import { Metadata } from 'next';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate';
import { 
    getUnifiedProducts, 
    getPlatformAnalysis 
} from '@shared/lib/api/django/adult';
import { getSiteMainPosts } from '@shared/lib/api/wordpress';

// 💡 動的レンダリングを強制し、常に最新の在庫・スコアを反映
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: '総合動画アーカイブ | TIPER',
    description: 'FANZA、DMM、DUGAを横断した統合デジタルアーカイブ。AI解析スコアに基づいた最強の検索体験を提供します。',
};

export default async function UnifiedVideosPage(props: {
    searchParams: Promise<{ page?: string; sort?: string; genre?: string; maker?: string }>;
}) {
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams?.page) || 1;
    const currentSort = searchParams?.sort || '-release_date';

    // --- 🏗️ 1. データ取得 (Django統合エンドポイントへ一斉射撃) ---
    const [
        productRes, 
        analysisData, 
        wpData
    ] = await Promise.all([
        getUnifiedProducts({
            site_group: 'adult',    // 💡 バックエンドで定義した site_group フィルタ
            page: currentPage,
            ordering: currentSort,
            genre: searchParams.genre, // 💡 ジャンル絞り込みも統合パスで対応
            maker: searchParams.maker, // 💡 メーカー絞り込みも同様
        }),
        // 'unified' を小文字で渡し、分析エンジンを起動
        getPlatformAnalysis('unified', { mode: 'summary', limit: 15 }).catch(() => null),
        // WordPressのニュース等があれば取得
        getSiteMainPosts(0, 8).catch(() => ({ results: [] }))
    ]);

    // --- 🛡️ 2. データの正規化 ---
    const products = productRes?.results || [];
    const totalCount = productRes?.count || 0;

    // サイドバー項目の抽出ロジック
    // バックエンドの PlatformMarketAnalysisAPIView のレスポンス構造に準拠
    const extractSidebarItems = (key: string) => {
        if (!analysisData) return [];
        // data.data 直下、あるいは data.results 内の指定キーを探す
        const items = analysisData[key] || (analysisData.results && analysisData.results[key]);
        return Array.isArray(items) ? items : [];
    };

    return (
        <ArchiveTemplate 
            /**
             * 💡 platform="video" は「横断表示モード」として機能。
             * ArchiveTemplate 内で `product.api_source` が何であっても
             * 排除せずに表示するフラグとして利用。
             */
            platform="video" 
            title="UNIFIED VIDEO ARCHIVE"
            products={products}
            totalCount={totalCount}
            
            // 📊 統合分析データから生成されるダイナミックサイドバー
            makers={extractSidebarItems('makers')}
            genres={extractSidebarItems('genres')}
            series={extractSidebarItems('series')}
            directors={extractSidebarItems('directors')}
            authors={extractSidebarItems('authors')}
            
            // 📰 WordPress 関連記事
            recentPosts={(wpData?.results || []).map((p: any) => ({
                id: p.id.toString(),
                title: p.title?.rendered || 'No Title',
                slug: p.slug,
                date: p.date
            }))}
            
            currentPage={currentPage}
            currentSort={currentSort}
            basePath="/videos"
        />
    );
}