'use client';

/**
 * =====================================================================
 * 📋 BICSTATION Product Sort Selector (Ultimate v13.0)
 * 🛡️ 役割: 
 * 1. ソート順の変更を管理
 * 2. URLパラメータの正規化 (gpu, cpu 等を attribute に一本化)
 * 3. ページネーション整合性保持 (ソート変更時に page/offset をリセット)
 * =====================================================================
 */

import { useRouter, useSearchParams } from 'next/navigation';
import styles from './ProductSortSelector.module.css';

/** 🏷️ ソートオプション定義 */
const SORT_OPTIONS = [
    { label: '🔥 新着順', value: '-created_at' },
    { label: '💰 安い順', value: 'price' },
    { label: '💎 高い順', value: '-price' },
    { label: '🧠 AIスコア順', value: '-score_ai' },
    { label: '📝 名称順', value: 'name' },
];

interface SortSelectorProps {
    currentSort: string;
}

export default function ProductSortSelector({ currentSort }: SortSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    /** ⚙️ ソート変更ハンドラー */
    const handleSortChange = (value: string) => {
        // 現在のURLパラメータをコピー
        const params = new URLSearchParams(searchParams.toString());

        /**
         * 🚩 【重要：パラメータ正規化ロジック】
         * サイドバー（PCSidebar.tsx）から渡される多様なキーを、
         * Django APIが期待する唯一のキー 'attribute' に集約します。
         */
        const specialKeys = ['gpu', 'cpu', 'os', 'memory', 'feature'];
        
        // 既存の attribute 値、または個別キーの値を優先して取得
        let integratedAttr = params.get('attribute') || '';

        specialKeys.forEach(key => {
            const val = params.get(key);
            if (val) {
                // 個別キーに値があれば、それを attribute として採用
                integratedAttr = val;
                // 二重にパラメータが存在しないよう、古い個別キーは削除
                params.delete(key);
            }
        });

        // 集約した attribute をセット
        if (integratedAttr) {
            params.set('attribute', integratedAttr);
        }

        // 基本パラメータの更新
        params.set('sort', value);
        
        // 🚩 【整合性維持】ソート順が変わった場合、古いページ位置は無効になるため削除
        params.delete('page');
        params.delete('offset');

        /** 🔍 デバッグ用ログ (必要に応じてブラウザのコンソールで確認可能) */
        console.log(`[SORT_SYNC] New Sort: ${value} | Integrated Attr: ${integratedAttr || 'NONE'}`);

        // URLを更新（スクロールをトップに戻さない設定）
        const queryString = params.toString();
        router.push(`?${queryString}`, { scroll: false });
    };

    return (
        <nav className={styles.selectorWrapper} aria-label="製品ソート">
            <div className={styles.buttonGroup}>
                {SORT_OPTIONS.map((opt) => {
                    const isActive = currentSort === opt.value;
                    
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            className={`${styles.sortButton} ${isActive ? styles.active : ''}`}
                            onClick={() => handleSortChange(opt.value)}
                            aria-pressed={isActive}
                        >
                            <span className={styles.buttonLabel}>{opt.label}</span>
                            {isActive && <span className={styles.activeIndicator} />}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}