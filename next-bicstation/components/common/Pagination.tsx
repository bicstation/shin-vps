import React from 'react';
import Link from 'next/link';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentOffset: number;
  limit: number;
  totalCount: number;
  baseUrl: string; // 例: "/" や "/products"
}

export default function Pagination({ 
  currentOffset, 
  limit, 
  totalCount, 
  baseUrl 
}: PaginationProps) {
  const currentPage = Math.floor(currentOffset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);

  // 前後のデータがあるか判定
  const hasPrevious = currentOffset > 0;
  const hasNext = currentOffset + limit < totalCount;

  if (totalPages <= 1) return null; // 1ページしかなければ表示しない

  return (
    <div className={styles.pagination}>
      {hasPrevious ? (
        <Link 
          href={`${baseUrl}?offset=${currentOffset - limit}`} 
          className={styles.pageButton}
        >
          ← 前のページ
        </Link>
      ) : (
        <span style={{ width: '120px' }}></span> // レイアウト崩れ防止の余白
      )}

      <span className={styles.pageInfo}>
        {currentPage} / {totalPages}
      </span>

      {hasNext ? (
        <Link 
          href={`${baseUrl}?offset=${currentOffset + limit}`} 
          className={styles.pageButton}
        >
          次のページ →
        </Link>
      ) : (
        <span style={{ width: '120px' }}></span>
      )}
    </div>
  );
}