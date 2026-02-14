'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ArchiveTemplate from '../ArchiveTemplate'; 
import styles from './DugaPage.module.css';

/**
 * 🛰️ DUGA_CORE_VIEWER
 * トップページの「安定レイアウト」を継承したDUGA専用アーカイブ・ビュー
 */
export default function DugaPageView({ 
    data, makersData, genresData, wpData, offset, ordering 
}: any) {
    const [showInspector, setShowInspector] = useState(true);

    // --- 🧬 1. データの正規化 ---
    const products = (Array.isArray(data) ? data : data?.results || []);
    const totalCount = data?.count || products.length || 0;

    // --- 🧬 2. メーカーデータの抽出 (DUGA純度確保) ---
    const rawMakers = Array.isArray(makersData) ? makersData : (makersData as any)?.results || [];
    const topMakers = rawMakers
        .filter((m: any) => m.api_source === 'DUGA' || !m.api_source)
        .slice(0, 25)
        .map((m: any) => ({
            id: m.id,
            name: m.name,
            slug: m.slug || m.id.toString(),
            product_count: m.product_count || m.count || 0
        }));

    // --- 🧬 3. ジャンルデータの抽出 ---
    const rawGenres = Array.isArray(genresData) ? genresData : (genresData as any)?.results || [];
    const topGenres = rawGenres
        .slice(0, 20)
        .map((g: any) => ({
            id: g.id,
            name: g.name,
            slug: g.slug || g.id.toString(),
            product_count: g.product_count || g.count || 0
        }));

    // --- 🧬 4. お知らせデータの抽出 ---
    const rawPosts = Array.isArray(wpData) ? wpData : (wpData?.results || []);
    const wpPosts = rawPosts.map((p: any) => ({
        id: p.id?.toString(),
        title: p.title?.rendered || p.title || "Untitled",
        slug: p.slug || ""
    }));

    // --- 📡 DUGAコンテキストの生成 ---
    const dugaContext = { 
        ...(products[0] || {}), 
        api_source: 'duga' 
    };

    return (
        <div className={`${styles.pageContainer} duga-theme`}>
            
            {/* 🛠️ SYSTEM_INSPECTOR: データパイプラインの可視化 */}
            {showInspector && (
                <div style={{
                    background: '#0a0a12', borderBottom: '2px solid #e94560',
                    padding: '12px 20px', fontFamily: 'monospace', fontSize: '11px', color: '#00f0ff',
                    boxShadow: '0 5px 25px rgba(0,0,0,0.8)', position: 'sticky', top: 0, zIndex: 1000
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>🛰️ DUGA_CORE_INSPECTOR // NODE_SYNC_MONITOR</span>
                        <button onClick={() => setShowInspector(false)} style={{ background: '#e94560', color: '#fff', border: 'none', padding: '1px 8px', cursor: 'pointer', fontSize: '10px' }}>SHUTDOWN</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                        <div style={{ borderLeft: '2px solid #e94560', paddingLeft: '8px' }}>
                            <div style={{ color: '#888' }}>[01] PRODUCT_STREAM</div>
                            STATUS: <span style={{ color: products.length > 0 ? '#0f0' : '#f00' }}>{products.length > 0 ? 'SYNCED' : 'EMPTY'}</span> <br />
                            FORMAT: {Array.isArray(data) ? 'RAW_ARRAY' : 'PAGINATED'}
                        </div>
                        <div style={{ borderLeft: '2px solid #f0f', paddingLeft: '8px' }}>
                            <div style={{ color: '#888' }}>[02] MAKER_NODE</div>
                            FILTERED: {topMakers.length} UNITS <br />
                            RAW: {rawMakers.length} ITEMS
                        </div>
                        <div style={{ borderLeft: '2px solid #0ea5e9', paddingLeft: '8px' }}>
                            <div style={{ color: '#888' }}>[03] GENRE_NODE</div>
                            GENRE_COUNT: {topGenres.length} <br />
                            MAP_STATE: SUCCESS
                        </div>
                        <div style={{ borderLeft: '2px solid #fbbf24', paddingLeft: '8px' }}>
                            <div style={{ color: '#888' }}>[04] NETWORK_LOG</div>
                            ORDER: {ordering || 'DEFAULT'} <br />
                            TOTAL: {totalCount.toLocaleString()}
                        </div>
                    </div>
                </div>
            )}

            {/* 🛰️ SYSTEM MONITOR BAR */}
            <div className={styles.systemMonitor}>
                <span className="flex items-center gap-2">
                    <span className={`${styles.statusDot} animate-pulse`} /> 
                    DUGA_NETWORK_SYNC: <span style={{ color: products.length > 0 ? '#0f0' : '#f00' }}>{products.length > 0 ? 'ONLINE' : 'OFFLINE'}</span>
                </span>
                <span className={styles.sourceTag}>SOURCE: DUGA_REPOSITORIES</span>
                <span>[NODES: {products.length}]</span>
                <span>[TOTAL: {totalCount.toLocaleString()}]</span>
                
                <div className={styles.platformLinks}>
                    <Link href="/fanza" className={styles.platformLink}>FANZA_LINK</Link>
                    <Link href="/dmm" className={styles.platformLink}>DMM_LINK</Link>
                </div>
            </div>

            {/* 🏗️ MAIN CONTENT AREA (トップページと同じ骨組み) */}
            <main className={styles.main}>
                <div className={styles.wrapper}>
                    {/* ArchiveTemplate内でサイドバーとコンテンツの左右分割を行います。
                      ここでのレイアウト崩れを防ぐため、コンテナはフル幅で渡します。
                    */}
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
                        analysisData={dugaContext} 
                    />
                </div>
            </main>
        </div>
    );
}