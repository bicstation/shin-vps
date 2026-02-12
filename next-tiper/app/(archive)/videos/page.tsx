/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ==============================================================================
 * 🎬 TIPER Archive - Video Intelligence Node (Server Entry)
 * ==============================================================================
 */
import React from 'react';
import { Metadata } from 'next';
import { getUnifiedProducts, fetchMakers } from '@shared/lib/api/django';
import { fetchPostList } from '@shared/lib/api';
import VideoArchiveView from './VideoArchiveView';

export const dynamic = 'force-dynamic';
export const revalidate = 60;
const LIMIT = 24;

const SOURCE_OPTIONS = [
  { label: 'ALL_SYSTEMS', value: '' },
  { label: 'FANZA', value: 'FANZA' },
  { label: 'DMM', value: 'DMM' },
  { label: 'DUGA', value: 'DUGA' },
];

/**
 * ✅ 1. メタデータ生成 (Server Componentのみで動作)
 */
export async function generateMetadata(props: {
  searchParams: Promise<{ offset?: string; ordering?: string; api_source?: string }>
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const pageNum = Math.floor((Number(searchParams.offset) || 0) / LIMIT) + 1;
  const sourceLabel = SOURCE_OPTIONS.find(o => o.value === searchParams.api_source)?.label || '全ブランド';
  const title = `${sourceLabel} アーカイブ | PAGE_${pageNum} | TIPER LIVE`;
  return { title, description: `TIPER LIVE ${sourceLabel}の動画アーカイブ。` };
}

/**
 * 🎬 ビデオアーカイブ本体 (ロジック層)
 */
export default async function VideoArchivePage(props: {
  searchParams: Promise<{ 
    offset?: string; 
    ordering?: string; 
    api_source?: string;
    maker__slug?: string;
  }>
}) {
  const searchParams = await props.searchParams;
  const currentOffset = Number(searchParams.offset) || 0;
  const currentOrdering = searchParams.ordering || '-release_date';
  const currentSource = searchParams.api_source || '';
  const currentMakerSlug = searchParams.maker__slug || '';

  // --- 並行データフェッチ ---
  const [productData, makersRes, postsRes] = await Promise.all([
    getUnifiedProducts({ 
      limit: LIMIT, offset: currentOffset, ordering: currentOrdering,
      api_source: currentSource, maker_slug: currentMakerSlug
    }).catch(() => ({ results: [], count: 0 })),
    fetchMakers().catch(() => []),
    fetchPostList(5).catch(() => ({ results: [] }))
  ]);

  return (
    <VideoArchiveView 
      productData={productData}
      makersRes={makersRes}
      postsRes={postsRes}
      searchParams={searchParams}
      currentOffset={currentOffset}
      currentOrdering={currentOrdering}
      currentSource={currentSource}
      currentMakerSlug={currentMakerSlug}
      limit={LIMIT}
    />
  );
}