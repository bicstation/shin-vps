import React from "react";
import styles from "./BrandPage.module.css";

export default function Loading() {
    return (
        <div className={styles.pageContainer}>
            <header className={styles.fullWidthHeader} style={{ opacity: 0.5 }}>
                <div className={styles.headerInner}>
                    <div className={styles.skeletonTitle} />
                </div>
            </header>

            <div className={styles.wrapper}>
                <aside className={styles.sidebar} style={{ opacity: 0.3 }}>
                    <div className={styles.skeletonBox} style={{ height: '300px' }} />
                </aside>

                <main className={styles.main}>
                    <div className={styles.toolbar}>
                        <div className={styles.skeletonText} style={{ width: '150px' }} />
                    </div>
                    <div className={styles.productGrid}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.skeletonImage} />
                                <div className={styles.skeletonText} />
                                <div className={styles.skeletonText} style={{ width: '60%' }} />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
            {/* スキャンアニメーション */}
            <div className={styles.loadingScanner} />
        </div>
    );
}