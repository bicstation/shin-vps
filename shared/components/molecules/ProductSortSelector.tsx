'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import styles from './ProductSortSelector.module.css';

const SORT_OPTIONS = [
    { label: '🔥 新着順', value: '-created_at' },
    { label: '💰 安い順', value: 'price' },
    { label: '💎 高い順', value: '-price' },
    { label: '🧠 AIスコア順', value: '-score_ai' },
    { label: '📝 名称順', value: 'name' },
];

export default function ProductSortSelector({ currentSort }: { currentSort: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', value);
        params.delete('page'); // ソートを変えたら1ページ目に戻すのが親切
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className={styles.selectorWrapper}>
            <div className={styles.buttonGroup}>
                {SORT_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        className={`${styles.sortButton} ${currentSort === opt.value ? styles.active : ''}`}
                        onClick={() => handleSortChange(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}