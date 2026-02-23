"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '@shared/cards/ProductCard';
import styles from './PCFinderPage.module.css';

export default function PCFinderClient() {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    budget: 300000,
    type: 'all',
    brand: 'all',
    npuRequired: false,
    gpuRequired: false,
  });
  const [sortBy, setSortBy] = useState('newest');

  // スライダー表示用
  const [tempBudget, setTempBudget] = useState(filters.budget);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        budget: filters.budget.toString(),
        type: filters.type !== 'all' ? filters.type : '',
        brand: filters.brand !== 'all' ? filters.brand : '',
        npu: filters.npuRequired.toString(),
        gpu: filters.gpuRequired.toString(),
        sort: sortBy,
      });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pc-products/?${query}`);
      const data = await response.json();
      setProducts(data.results || data);
      setTotalCount(data.count || (Array.isArray(data) ? data.length : 0));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy]);

  // スライダーを止めてからリクエストを送る
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, budget: tempBudget }));
    }, 400);
    return () => clearTimeout(timer);
  }, [tempBudget]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div className={styles.fullWidthContainer}>
      <header className={styles.heroHeader}>
        <span className={styles.neonBadge}>LIVE DATABASE v2.0</span>
        <h1 className={styles.heroTitle}>PC_FINDER</h1>
        <p className={styles.heroSubText}>理想のスペックを、4,000件のアーカイブから即座に抽出。</p>
      </header>

      <nav className={styles.controlPanel}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.inlineLabel}>Budget: ¥{tempBudget.toLocaleString()}</label>
            <input 
              type="range" min="50000" max="1000000" step="10000" 
              value={tempBudget} onChange={e => setTempBudget(Number(e.target.value))}
              className={styles.modernRange}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.inlineLabel}>Form Factor</label>
            <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className={styles.minimalSelect}>
              <option value="all">ALL SHAPES</option>
              <option value="type-laptop">LAPTOP</option>
              <option value="type-desktop">DESKTOP</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.inlineLabel}>Manufacturer</label>
            <select value={filters.brand} onChange={e => setFilters({...filters, brand: e.target.value})} className={styles.minimalSelect}>
              <option value="all">ALL BRANDS</option>
              <option value="apple">Apple</option>
              <option value="lenovo">Lenovo</option>
              <option value="dell">DELL</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.inlineLabel}>Order By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={styles.minimalSelect}>
              <option value="newest">NEWEST</option>
              <option value="price_asc">PRICE: LOW</option>
              <option value="spec_score">SCORE: HIGH</option>
            </select>
          </div>
        </div>

        <div className={styles.chipRow}>
          <button onClick={() => setFilters({...filters, npuRequired: !filters.npuRequired})} className={filters.npuRequired ? styles.chipActive : styles.chip}>
            NPU (AI PC)
          </button>
          <button onClick={() => setFilters({...filters, gpuRequired: !filters.gpuRequired})} className={filters.gpuRequired ? styles.chipActive : styles.chip}>
            DEDICATED GPU
          </button>
          <div className={styles.counterDisplay}>
            HITS: <strong>{totalCount}</strong>
          </div>
        </div>
      </nav>

      <main className={styles.mainGallery}>
        <div className={styles.productGrid}>
          {isLoading ? (
            [...Array(8)].map((_, i) => <div key={i} className={styles.skeleton} />)
          ) : (
            products.map(p => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </main>
    </div>
  );
}