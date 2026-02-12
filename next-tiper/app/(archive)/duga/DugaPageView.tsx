'use client';

import React from 'react';
import ArchiveTemplate from '../ArchiveTemplate'; 

export default function DugaPageView({ 
    data, makersData, genresData, wpData, offset, ordering 
}: any) {
    const products = data?.results || [];
    const totalCount = data?.count || 0;

    // サイドバー用データの整形
    const topMakers = (Array.isArray(makersData) ? makersData : (makersData as any)?.results || [])
        .slice(0, 20)
        .map((m: any) => ({
            id: m.id,
            name: m.name,
            slug: m.slug || m.id.toString(),
            product_count: m.product_count || m.count || 0
        }));

    const topGenres = (Array.isArray(genresData) ? genresData : (genresData as any)?.results || [])
        .slice(0, 20)
        .map((g: any) => ({
            id: g.id,
            name: g.name,
            slug: g.slug || g.id.toString(),
            product_count: g.product_count || g.count || 0
        }));

    const wpPosts = (wpData?.results || []).map((p: any) => ({
        id: p.id?.toString(),
        title: p.title?.rendered || "Untitled",
        slug: p.slug || ""
    }));

    return (
        <div className="duga-theme">
            {/* 🛰️ SYSTEM MONITOR */}
            <div className="bg-[#0a1917] border-b border-[#00d1b2]/30 px-4 py-2 font-mono text-[10px] text-[#00d1b2] flex flex-wrap gap-x-6">
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00d1b2] animate-pulse"></span> 
                    DUGA_NETWORK_SYNC: ONLINE
                </span>
                <span>[SOURCE: DUGA_CORE]</span>
                <span>[NODES_IN_VIEW: {products.length}]</span>
                <span>[TOTAL_REGISTRY: {totalCount}]</span>
            </div>

            <ArchiveTemplate 
                products={products}
                totalCount={totalCount}
                platform="duga"
                title="DUGA ARCHIVE"
                makers={topMakers}
                genres={topGenres}
                recentPosts={wpPosts}
                currentSort={ordering}
                currentOffset={offset}
                basePath="/brand/duga"
                analysisData={products[0]} 
            />

            <style jsx global>{`
                .duga-theme {
                    --accent-color: #00d1b2;
                    --accent-glow: rgba(0, 209, 178, 0.2);
                }
                .duga-theme ::selection {
                    background: rgba(0, 209, 178, 0.3);
                    color: #fff;
                }
            `}</style>
        </div>
    );
}