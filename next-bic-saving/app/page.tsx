/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
// ✅ 統一された Django Posts サービスをインポート
import { fetchPostList } from '@/shared/lib/api/django/posts'; 
import { UnifiedPost } from '@/shared/lib/api/types';

/**
 * 💡 Next.js 15 用の動的レンダリング設定
 * 一般サイトのため、最新の節約情報を常に反映させます。
 */
export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

// ユーティリティ: HTMLエスケープ解除と日付フォーマット
const decodeHtml = (html: string) => html?.replace(/&[^;]+;/g, ' ') || '';
const formatDate = (dateString: string) => 
    dateString ? new Date(dateString).toLocaleDateString('ja-JP') : 'RECENT';

/**
 * 🏠 ビック的節約生活 メインページ
 * 🚀 モックデータを廃止し、APIからの実データのみを表示します。
 */
export default async function Page() {
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'ビック的な最新記事';
    const project = 'saving'; // 節約プロジェクト識別子

    let posts: UnifiedPost[] = [];
    let count = 0;

    try {
        /**
         * 🛰️ 実弾データ取得
         * fetchPostList 内部で UnifiedPost への変換と検閲(is_adult)が完了しています。
         */
        const response = await fetchPostList(12, 0, project);
        posts = response?.results || [];
        count = response?.count || 0;
    } catch (error) {
        console.error("[FrontPage] API Connection Failed:", error);
        // モックは流さず、エラー時は空配列（またはエラーメッセージ）で対応
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ 
                    color: '#333', 
                    borderLeft: '5px solid #ffcc00', 
                    padding: '5px 15px',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    letterSpacing: '-0.02em'
                }}>
                    {title}
                </h2>
                {count > 0 && (
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 'bold' }}>
                        TOTAL_REPORTS: {count}
                    </span>
                )}
            </header>
            
            {posts.length > 0 ? (
                <div style={{ 
                    display: 'grid', 
                    gap: '24px', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' 
                }}>
                    {posts.map((post: UnifiedPost) => (
                        <article key={post.id} style={{ 
                            background: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '16px', 
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s ease'
                        }}>
                            {/* アイキャッチ画像エリア */}
                            <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                                <img 
                                    src={post.image} 
                                    alt={post.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    loading="lazy"
                                />
                            </div>

                            <div style={{ padding: '20px', flexGrow: 1 }}>
                                <div style={{ 
                                    color: '#ffaa00', 
                                    fontSize: '0.7rem', 
                                    fontWeight: '800', 
                                    marginBottom: '8px',
                                    textTransform: 'uppercase'
                                }}>
                                    {post.content_type_display || 'SAVING_STRATEGY'}
                                </div>
                                <Link href={`/saving/${post.slug}`} style={{ textDecoration: 'none' }}>
                                    <h3 style={{ 
                                        color: '#111', 
                                        fontSize: '1.1rem', 
                                        fontWeight: '800', 
                                        margin: '0 0 12px 0',
                                        lineHeight: '1.4',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {decodeHtml(post.title)}
                                    </h3>
                                </Link>
                                <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                    📅 {formatDate(post.created_at)}
                                </div>
                            </div>
                            
                            <Link href={`/saving/${post.slug}`} style={{ 
                                padding: '14px', 
                                textAlign: 'center', 
                                background: '#fefce8', 
                                color: '#a16207', 
                                fontSize: '0.85rem', 
                                fontWeight: '700', 
                                textDecoration: 'none',
                                borderTop: '1px solid #fef08a',
                                transition: 'background 0.2s'
                            }}>
                                詳細レポートを閲覧する →
                            </Link>
                        </article>
                    ))}
                </div>
            ) : (
                /* データ不在時の表示 */
                <div style={{ 
                    padding: '100px 20px', 
                    textAlign: 'center', 
                    background: '#fff', 
                    borderRadius: '16px',
                    border: '2px dashed #e5e7eb'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔍</div>
                    <p style={{ color: '#9ca3af', fontWeight: 'bold' }}>現在、新しい節約レポートを解析中です...</p>
                    <p style={{ fontSize: '0.8rem', color: '#d1d5db' }}>NO_POSTS_FOUND_IN_STREAM</p>
                </div>
            )}

            <footer style={{ 
                marginTop: '60px', 
                padding: '20px 0',
                borderTop: '1px dashed #e5e7eb',
                fontSize: '10px', 
                color: '#9ca3af', 
                textAlign: 'center',
                fontFamily: 'monospace'
            }}>
                SYSTEM_NODE: BIC_SAVING_FRONT / PROJECT: {project} / STATUS: API_LIVE
            </footer>
        </div>
    );
}