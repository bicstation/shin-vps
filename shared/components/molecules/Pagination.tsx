'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './Pagination.module.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    query?: Record<string, string | null | undefined>;
}

export default function Pagination(props: PaginationProps) {
    return (
        <Suspense fallback={<div className={styles.loading}>LOADING_PAGINATION_STREAM...</div>}>
            <PaginationInner {...props} />
        </Suspense>
    );
}

function PaginationInner({ currentPage, totalPages, baseUrl, query }: PaginationProps) {
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    // URL生成ロジック：既存のクエリを維持しつつページを更新
    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        
        // ページ番号の設定（1ページ目はパラメータなしにするのがSEO的に綺麗）
        if (pageNumber <= 1) params.delete('page');
        else params.set('page', pageNumber.toString());

        // 追加クエリ（sortやbrand等）を上書き反映
        if (query) {
            Object.entries(query).forEach(([key, value]) => {
                if (value) params.set(key, value);
                else params.delete(key);
            });
        }

        const queryString = params.toString();
        return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
    };

    const getPageNumbers = () => {
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
        const pages = [];
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className={styles.paginationContainer} aria-label="データナビゲーション">
            <div className={styles.statsText}>
                SEQUENCE <span className={styles.accentText}>{currentPage}</span> / {totalPages}
            </div>
            
            <ul className={styles.paginationList}>
                {/* PREV */}
                <li>
                    {currentPage > 1 ? (
                        <Link href={createPageUrl(currentPage - 1)} className={styles.arrowButton}>
                            « PREV
                        </Link>
                    ) : (
                        <span className={`${styles.arrowButton} ${styles.disabled}`}>« PREV</span>
                    )}
                </li>

                {/* FIRST */}
                {pageNumbers[0] > 1 && (
                    <>
                        <li><Link href={createPageUrl(1)} className={styles.pageNumber}>1</Link></li>
                        {pageNumbers[0] > 2 && <li className={styles.dots}>...</li>}
                    </>
                )}

                {/* NUMBERS */}
                {pageNumbers.map((page) => (
                    <li key={page}>
                        <Link
                            href={createPageUrl(page)}
                            className={`${styles.pageNumber} ${page === currentPage ? styles.active : ''}`}
                        >
                            {page}
                        </Link>
                    </li>
                ))}

                {/* LAST */}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <li className={styles.dots}>...</li>}
                        <li><Link href={createPageUrl(totalPages)} className={styles.pageNumber}>{totalPages}</Link></li>
                    </>
                )}

                {/* NEXT */}
                <li>
                    {currentPage < totalPages ? (
                        <Link href={createPageUrl(currentPage + 1)} className={styles.arrowButton}>
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