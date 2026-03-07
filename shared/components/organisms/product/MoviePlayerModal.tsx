'use client';

import React, { useState, useEffect } from 'react';
import styles from './MoviePlayerModal.module.css';

interface MoviePlayerModalProps {
  videoUrl: string;
  title: string;
}

export default function MoviePlayerModal({ videoUrl, title }: MoviePlayerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // URLから再生方式を自動判別
  // FANZA(dmm.co.jp / fanza.com)が含まれる場合はiframe、それ以外（DUGA等）はvideoタグ
  const isIframeMode = videoUrl.includes('dmm.co.jp') || videoUrl.includes('fanza.com');

  if (!videoUrl) return null;

  // モーダルが開いている間、背景スクロールを防止する処理
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* 🚀 再生ボタン：サイバーパンクデザイン */}
      <button onClick={() => setIsOpen(true)} className={styles.playBtn}>
        <div className={styles.playIconContainer}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
        </div>
        <span className="ml-2 tracking-[0.2em] font-black italic">WATCH_SAMPLE_STREAM</span>
      </button>

      {/* 🔞 モーダル本体 */}
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* ヘッダーエリア */}
            <div className={styles.header}>
              <div className={styles.statusIndicator}>
                <span className={styles.blinkDot}>●</span>
                <span className="ml-2 uppercase tracking-tighter text-[10px]">Secure_Connection_Established</span>
              </div>
              <h3 className={styles.modalTitle}>{title}</h3>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <span className="text-xs mr-2 opacity-50">ESC</span>✕
              </button>
            </div>

            {/* 🎥 動画・iframe 描画エリア (ここが仕分けの肝) */}
            <div className={styles.videoContainer}>
              {isIframeMode ? (
                /* ✅ FANZA / DMM 用: iframe プレイヤー */
                <iframe
                  src={videoUrl}
                  className={styles.videoPlayer}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  scrolling="no"
                  frameBorder="0"
                />
              ) : (
                /* ✅ DUGA / 直接リンク用: video タグ */
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  className={styles.videoPlayer}
                />
              )}
              
              {/* サイバーパンク装飾レイヤー */}
              <div className={styles.scanline} />
              <div className={styles.glitchOverlay} />
              <div className={styles.cornerMarkerTR} />
              <div className={styles.cornerMarkerBL} />
            </div>

            {/* フッターエリア */}
            <div className={styles.footer}>
              <div className="flex justify-between items-center w-full px-4 text-[9px] font-mono text-gray-500 uppercase">
                <span>Node: {isIframeMode ? 'EXT_IFRAME_SERVER' : 'DIRECT_STREAM_NODE'}</span>
                <span className="text-[#e94560]">Tiper_Live_Archive_System_v6.2</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}