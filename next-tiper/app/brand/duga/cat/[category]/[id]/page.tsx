import React from 'react';
import ArchiveTemplate from '@/app/brand/ArchiveTemplate'; 
// ↑ パスはディレクトリ階層に合わせて調整してください（app/brand/ArchiveTemplate.tsx）

/**
 * 🛰️ DUGA_CATEGORY_DYNAMIC_ROUTER
 * [category] : 'genre', 'maker', 'series' 等
 * [id]       : 各カテゴリの識別ID
 */
export default async function DugaCategoryPage({ params, searchParams }: any) {
    const { category, id } = params;
    const offset = parseInt(searchParams.offset || '0');
    const ordering = searchParams.ordering || 'new';

    // 🧬 1. DUGA APIからデータを取得 (サーバーサイド)
    // ここでは getDugaProducts などの既存のデータ取得関数を呼び出す想定です
    const data = await fetchDugaCategoryData(category, id, offset, ordering);
    
    // 🧬 2. サイドバー用の補助データ取得 (メーカー一覧など)
    const makersData = await fetchDugaMakers();
    const genresData = await fetchDugaGenres();

    // 🧬 3. カテゴリ名などのタイトルを特定
    const pageTitle = `DUGA ${category.toUpperCase()}: ${id}`;

    return (
        <ArchiveTemplate 
            products={data?.results || []}
            totalCount={data?.count || 0}
            platform="duga"
            title={pageTitle}
            makers={makersData?.results || []}
            genres={genresData?.results || []}
            recentPosts={[]} // 必要に応じてWordPressデータを注入
            currentSort={ordering}
            currentOffset={offset}
            basePath={`/brand/duga/${category}/${id}`}
            extraParams={{}} 
        />
    );
}

// --- 🛰️ DATA_FETCHING_LOGIC (参考実装) ---
async function fetchDugaCategoryData(category: string, id: string, offset: number, ordering: string) {
    // DUGAのAPIエンドポイントに対し、categoryに応じたクエリを投げる
    // 例: category === 'genre' なら ?genreid=${id}
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(
        `${baseUrl}/api/duga/products/?${category}id=${id}&offset=${offset}&ordering=${ordering}`,
        { next: { revalidate: 3600 } }
    );
    return res.json();
}

async function fetchDugaMakers() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/api/duga/makers/`, { next: { revalidate: 86400 } });
    return res.json();
}

async function fetchDugaGenres() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/api/duga/genres/`, { next: { revalidate: 86400 } });
    return res.json();
}