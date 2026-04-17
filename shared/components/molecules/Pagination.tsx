'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './Pagination.module.css';

/**
 * 【入口：Propsの定義】
 * @interface PaginationProps
 * @property {number} currentPage - 現在表示中のページ番号（1-based）
 * @property {number} totalPages - 全体のページ数
 * @property {string} baseUrl - ページネーションを適用するベースパス（例: "/product"）
 * @property {Record<string, string | null | undefined>} query - ページ遷移時に「追加・上書き」したいクエリパラメータ
 */
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    query?: Record<string, string | null | undefined>;
}

/**
 * Pagination コンポーネント (Main)
 * Suspenseでラップし、useSearchParamsによるクライアントサイドレンダリングを安全に行います。
 */
export default function Pagination(props: PaginationProps) {
    return (
        <Suspense fallback={<div className={styles.loading}>LOADING_PAGINATION_STREAM...</div>}>
            <PaginationInner {...props} />
        </Suspense>
    );
}

function PaginationInner({ currentPage, totalPages, baseUrl, query }: PaginationProps) {
    const searchParams = useSearchParams();

    // 1ページしかない場合は非表示
    if (totalPages <= 1) return null;

    /**
     * 【出口：createPageUrl 関数の仕様】
     * 1. 既存のブラウザURLの検索パラメータ（useSearchParams）を取得
     * 2. 指定された `pageNumber` を更新（1ページ目の場合はSEOのため 'page' キー自体を削除）
     * 3. `query` プロップスで渡された追加パラメータを最優先で上書き（null/undefinedの場合は削除）
     * @returns {string} 生成されたフルURL（例: "/product?page=2&maker=hp"）
     */
    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        
        // ページ番号の設定
        if (pageNumber <= 1) {
            params.delete('page');
        } else {
            params.set('page', pageNumber.toString());
        }

        // 追加クエリ（sortやmaker等）があれば反映
        if (query) {
            Object.entries(query).forEach(([key, value]) => {
                if (value) {
                    params.set(key, value);
                } else {
                    params.delete(key); // 値が空ならパラメータ自体を削除
                }
            });
        }

        const queryString = params.toString();
        // ベースURLの末尾がスラッシュで、クエリがある場合の整形
        const separator = baseUrl.includes('?') ? '&' : '?';
        return queryString ? `${baseUrl}${separator}${queryString}` : baseUrl;
    };

    /**
     * 表示するページ番号の配列を生成（現在のページを中心に前後2ページずつ）
     */
    const getPageNumbers = () => {
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className={styles.paginationContainer} aria-label="データナビゲーション">
            {/* ステータス表示 */}
            <div className={styles.statsText}>
                SEQUENCE <span className={styles.accentText}>{currentPage}</span> / {totalPages}
            </div>
            
            <ul className={styles.paginationList}>
                {/* PREV ボタン */}
                <li>
                    {currentPage > 1 ? (
                        <Link href={createPageUrl(currentPage - 1)} className={styles.arrowButton} scroll={false}>
                            « PREV
                        </Link>
                    ) : (
                        <span className={`${styles.arrowButton} ${styles.disabled}`}>« PREV</span>
                    )}
                </li>

                {/* 最初へのリンクと省略記号 */}
                {pageNumbers[0] > 1 && (
                    <>
                        <li>
                            <Link href={createPageUrl(1)} className={styles.pageNumber} scroll={false}>1</Link>
                        </li>
                        {pageNumbers[0] > 2 && <li className={styles.dots}>...</li>}
                    </>
                )}

                {/* 各ページ番号ボタン */}
                {pageNumbers.map((page) => (
                    <li key={page}>
                        <Link
                            href={createPageUrl(page)}
                            className={`${styles.pageNumber} ${page === currentPage ? styles.active : ''}`}
                            scroll={false}
                        >
                            {page}
                        </Link>
                    </li>
                ))}

                {/* 最後へのリンクと省略記号 */}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <li className={styles.dots}>...</li>}
                        <li>
                            <Link href={createPageUrl(totalPages)} className={styles.pageNumber} scroll={false}>
                                {totalPages}
                            </Link>
                        </li>
                    </>
                )}

                {/* NEXT ボタン */}
                <li>
                    {currentPage < totalPages ? (
                        <Link href={createPageUrl(currentPage + 1)} className={styles.arrowButton} scroll={false}>
                            NEXT »
                        </Link>
                    ) : (
                        <span className={`${styles.arrowButton} ${styles.disabled}`}>NEXT »</span>
                    )}
                </li>
            </ul>
        </nav>
    );
}