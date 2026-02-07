'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentOffset: number;
  limit: number;
  totalCount: number;
  basePath: string;
}

export default function Pagination({ 
  currentOffset, 
  limit, 
  totalCount, 
  basePath 
}: PaginationProps) {
  const searchParams = useSearchParams();
  
  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(currentOffset / limit) + 1;

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const newOffset = (pageNumber - 1) * limit;
    
    if (newOffset === 0) {
      params.delete('offset');
    } else {
      params.set('offset', newOffset.toString());
    }
    // pageパラメータがURLに残っている場合は紛らわしいので削除
    params.delete('page');

    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

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
    <nav className={styles.paginationContainer} aria-label="ページ送り">
      <ul className={styles.paginationList}>
        {/* 前へ */}
        <li>
          {currentPage > 1 ? (
            <Link href={createPageUrl(currentPage - 1)} className={styles.arrowButton}>
              <span className={styles.icon}>«</span> 前へ
            </Link>
          ) : (
            <span className={`${styles.arrowButton} ${styles.disabled}`}>« 前へ</span>
          )}
        </li>

        {/* 最初へのジャンプ */}
        {pageNumbers[0] > 1 && (
          <>
            <li><Link href={createPageUrl(1)} className={styles.pageNumber}>1</Link></li>
            {pageNumbers[0] > 2 && <li className={styles.dots}>...</li>}
          </>
        )}

        {/* メインの数字 (最大5つ) */}
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

        {/* 最後へのジャンプ */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <li className={styles.dots}>...</li>}
            <li><Link href={createPageUrl(totalPages)} className={styles.pageNumber}>{totalPages}</Link></li>
          </>
        )}

        {/* 次へ */}
        <li>
          {currentPage < totalPages ? (
            <Link href={createPageUrl(currentPage + 1)} className={styles.arrowButton}>
              次へ <span className={styles.icon}>»</span>
            </Link>
          ) : (
            <span className={`${styles.arrowButton} ${styles.disabled}`}>次へ »</span>
          )}
        </li>
      </ul>
    </nav>
  );
}