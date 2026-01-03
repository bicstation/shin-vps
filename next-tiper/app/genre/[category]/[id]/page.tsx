// app/genre/[category]/[id]/page.tsx
import React from 'react';
import ProductCard from '../../../components/ProductCard';
import Link from 'next/link';
import styles from './category.module.css'; // CSS Modulesをインポート

async function getCategoryProducts(category: string, id: string, page: string = '1', sort: string = '-created_at') {
  const pageSize = 20; 
  const query = new URLSearchParams({
    [category]: id,
    page: page,
    ordering: sort,
    page_size: pageSize.toString(),
  });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/?${query.toString()}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return { results: [], count: 0 };
    return res.json(); 
  } catch (error) {
    return { results: [], count: 0 };
  }
}

export default async function CategoryListPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ category: string, id: string }>,
  searchParams: Promise<{ page?: string, sort?: string }>
}) {
  const { category, id } = await params;
  const sParams = await searchParams;
  const currentPage = sParams.page || '1';
  const currentSort = sParams.sort || '-created_at'; 

  const data = await getCategoryProducts(category, id, currentPage, currentSort);
  const products = data.results || [];
  const totalCount = data.count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {category}: <span className={styles.titleMain}>{id}</span>
            </h1>
            <p className={styles.itemCount}>{totalCount.toLocaleString()} items found</p>
          </div>

          <div className={styles.sortList}>
            {[
              { label: '最新順', value: '-created_at' },
              { label: '人気順', value: '-views' },
              { label: '価格安い順', value: 'price' },
            ].map((opt) => (
              <Link
                key={opt.value}
                href={`/genre/${category}/${id}?page=1&sort=${opt.value}`}
                className={`${styles.sortButton} ${currentSort === opt.value ? styles.sortButtonActive : ''}`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {products.length > 0 ? (
          <div className={styles.grid}>
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>No products found in this category.</div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {parseInt(currentPage) > 1 ? (
              <Link 
                href={`/genre/${category}/${id}?page=${parseInt(currentPage) - 1}&sort=${currentSort}`}
                className={styles.pageLink}
              >
                PREV
              </Link>
            ) : (
              <span className={styles.pageDisabled}>PREV</span>
            )}
            
            <span className={styles.pageInfo}>
                Page <span className={styles.currentPage}>{currentPage}</span> / {totalPages}
            </span>

            {parseInt(currentPage) < totalPages ? (
              <Link 
                href={`/genre/${category}/${id}?page=${parseInt(currentPage) + 1}&sort=${currentSort}`}
                className={styles.pageLink}
              >
                NEXT
              </Link>
            ) : (
              <span className={styles.pageDisabled}>NEXT</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}