'use client';

import React, { useState } from 'react';
import styles from './MoviePlayerModal.module.css'; // 後述のCSS

export default function MoviePlayerModal({ videoUrl, title }: { videoUrl: string, title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!videoUrl) return null;

  return (
    <>
      {/* 再生ボタン */}
      <button onClick={() => setIsOpen(true)} className={styles.playBtn}>
        <span className="text-xl">🎬</span> WATCH SAMPLE MOVIE
      </button>

      {/* モーダル本体 */}
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <h3 className={styles.modalTitle}>{title}</h3>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
            </div>
            <div className={styles.videoWrapper}>
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                className={styles.videoPlayer}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}