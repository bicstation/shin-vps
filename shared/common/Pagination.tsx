'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentOffset: number;
  limit: number;
  totalCount: number;
  baseUrl: string;
}

export default function Pagination({ 
  currentOffset, 
  limit, 
  totalCount, 
  baseUrl 
}: PaginationProps) {
  const searchParams = useSearchParams();
  
  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(currentOffset / limit) + 1;

  // 1ページしかない場合は何も表示しない
  if (totalPages <= 1) return null;

  /**
   * 🚀 URL生成関数：現在のクエリを維持しつつoffsetのみ更新
   */
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const newOffset = (pageNumber - 1) * limit;
    params.set('offset', newOffset.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  /**
   * 🚀 表示するページ番号の計算ロジック
   * 現在のページを中心に最大5つの数字を表示
   */
  const getPageNumbers = () => {
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
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
    <nav className={styles.pagination}>
      {/* 「前へ」ボタン */}
      {currentPage > 1 ? (
        <Link href={createPageUrl(currentPage - 1)} className={styles.pageButton}>
          &laquo; 前へ
        </Link>
      ) : (
        <span className={`${styles.pageButton} ${styles.disabled}`}>&laquo; 前へ</span>
      )}

      {/* 最初のページへのショートカット */}
      {pageNumbers[0] > 1 && (
        <>
          <Link href={createPageUrl(1)} className={styles.pageNumber}>1</Link>
          {pageNumbers[0] > 2 && <span className={styles.dots}>...</span>}
        </>
      )}

      {/* 数字ボタンの並び */}
      {pageNumbers.map((page) => (
        <Link
          key={page}
          href={createPageUrl(page)}
          className={`${styles.pageNumber} ${page === currentPage ? styles.active : ''}`}
        >
          {page}
        </Link>
      ))}

      {/* 最後のページへのショートカット */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className={styles.dots}>...</span>}
          <Link href={createPageUrl(totalPages)} className={styles.pageNumber}>{totalPages}</Link>
        </>
      )}

      {/* 「次へ」ボタン */}
      {currentPage < totalPages ? (
        <Link href={createPageUrl(currentPage + 1)} className={styles.pageButton}>
          次へ &raquo;
        </Link>
      ) : (
        <span className={`${styles.pageButton} ${styles.disabled}`}>次へ &raquo;</span>
      )}
    </nav>
  );
}