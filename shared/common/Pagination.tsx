'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import styles from './Pagination.module.css';

interface PaginationProps {
    currentOffset: number;
    limit: number;
    totalCount: number;
    basePath?: string;
}

/**
 * 💡 汎用Paginationコンポーネント
 * サイトごとの色の違いはCSS変数 --theme-color で吸収します
 */
export default function Pagination(props: PaginationProps) {
    return (
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <PaginationInner {...props} />
        </Suspense>
    );
}

function PaginationInner({ 
    currentOffset, 
    limit, 
    totalCount, 
    basePath 
}: PaginationProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(currentOffset / limit) + 1;

    // 1ページ以下なら何も表示しない
    if (totalPages <= 1) return null;

    // URL生成ロジック：現在のクエリ（カテゴリ等）を維持したまま offset のみ更新
    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        const newOffset = (pageNumber - 1) * limit;
        
        if (newOffset <= 0) {
            params.delete('offset');
        } else {
            params.set('offset', newOffset.toString());
        }
        params.delete('page'); // 重複パラメータの掃除

        const targetPath = basePath || pathname;
        return `${targetPath}?${params.toString()}`;
    };

    // 表示する数字の範囲計算（カレントの前後2ページ、計5ページ分）
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
        <nav className={styles.paginationContainer} aria-label="ページナビゲーション">
            {/* ページ情報のテキスト表示 */}
            <div className={styles.statsText}>
                PAGE <span className={styles.accentText}>{currentPage}</span> / {totalPages}
            </div>
            
            <ul className={styles.paginationList}>
                {/* 「前へ」ボタン */}
                <li className={styles.listItem}>
                    {currentPage > 1 ? (
                        <Link href={createPageUrl(currentPage - 1)} className={styles.navButton}>
                            <span className={styles.arrowIcon}>«</span> PREV
                        </Link>
                    ) : (
                        <span className={`${styles.navButton} ${styles.disabled}`}>« PREV</span>
                    )}
                </li>

                {/* 1ページ目へのジャンプ（範囲外の場合） */}
                {pageNumbers[0] > 1 && (
                    <>
                        <li className={styles.listItem}>
                            <Link href={createPageUrl(1)} className={styles.pageNumber}>1</Link>
                        </li>
                        {pageNumbers[0] > 2 && <li className={styles.dots}>...</li>}
                    </>
                )}

                {/* メインの数字ボタン */}
                {pageNumbers.map((page) => (
                    <li key={page} className={styles.listItem}>
                        <Link
                            href={createPageUrl(page)}
                            className={`${styles.pageNumber} ${page === currentPage ? styles.active : ''}`}
                        >
                            {page}
                        </Link>
                    </li>
                ))}

                {/* 最終ページへのジャンプ（範囲外の場合） */}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <li className={styles.dots}>...</li>}
                        <li className={styles.listItem}>
                            <Link href={createPageUrl(totalPages)} className={styles.pageNumber}>{totalPages}</Link>
                        </li>
                    </>
                )}

                {/* 「次へ」ボタン */}
                <li className={styles.listItem}>
                    {currentPage < totalPages ? (
                        <Link href={createPageUrl(currentPage + 1)} className={styles.navButton}>
                            NEXT <span className={styles.arrowIcon}>»</span>
                        </Link>
                    ) : (
                        <span className={`${styles.navButton} ${styles.disabled}`}>NEXT »</span>
                    )}
                </li>
            </ul>
        </nav>
    );
}