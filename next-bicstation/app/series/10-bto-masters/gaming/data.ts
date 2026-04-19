import { Episode, BTO_SERIES_CONFIG } from '../data';

/**
 * BTO Masters: Gaming Series (Vol.1 - 40)
 * ゲーミングに特化した詳細エピソードデータ
 */

export const GAMING_SERIES_DETAIL = {
  ...BTO_SERIES_CONFIG.gaming,
  episodes: Array.from({ length: 40 }, (_, i) => {
    const vol = i + 1;
    let titleContent = "";
    let hintContent = "";

    // 1-10: 守護者フェーズ
    if (vol <= 10) {
      const titles = [
        "マザーボードは『道路』である",
        "CPU選定：シングルスレッドの真実",
        "電源ユニット：変換効率という名の静寂",
        "最小構成OS：不要なプロセスを殺せ",
        "ストレージの熱：サーマルスロットリングの罠",
        "メモリレイテンシ：CL値の呪縛を解く",
        "ケース内血流：正圧と負圧の分岐点",
        "有線LAN：パケットロスの1%を追え",
        "ドライバ最適化：最新が最良とは限らない",
        "守護者の誕生：15万円の限界突破"
      ];
      titleContent = titles[vol - 1] || "演算の心臓部を選定せよ";
      hintContent = "電源ユニットは容量の2倍の理論値を確保せよ。変換効率のピークを狙うのが鉄則だ。";
    } 
    // 11-20: 執行者フェーズ
    else if (vol <= 20) {
      const titles = [
        "GPU換装：FPSの暴力的な上昇",
        "リフレッシュレート：240Hzの世界線",
        "モニター同期：G-SYNC/FreeSyncの光と影",
        "VRAM管理：テクスチャ品質の最適解",
        "冷却の極致：空冷から水冷への移行準備",
        "0.1% Low：カクつきの正体を暴く",
        "カラープロファイル：敵の影を強調せよ",
        "DisplayPortの品質：ケーブルで速度は変わる",
        "GPU電圧制御：低電圧化による安定動作",
        "執行者の進撃：30万円の破壊力"
      ];
      titleContent = titles[vol - 11] || "高リフレッシュレートの暴力";
      hintContent = "0.1% Lowフレームレートの維持こそが真の性能である。平均値に騙されるな。";
    } 
    // 21-30: 賢者フェーズ
    else if (vol <= 30) {
      const titles = [
        "音響索敵：DAC導入による解像度革命",
        "ポーリングレート：8000Hzの恩恵",
        "マウスソール：摩擦係数の物理学",
        "キーボード反応速度：ラピッドトリガーの衝撃",
        "電力の浄化：ノイズフィルターの魔術",
        "サウンドカードの終焉と外部アンプの台頭",
        "OSカーネル微調整：タイマー精度の向上",
        "ネットワークスタック：TCP最適化の設定",
        "ジッターの完全排除：安定した信号伝達",
        "賢者の境地：50万円の完成体"
      ];
      titleContent = titles[vol - 21] || "ジッターを殺す最終調整";
      hintContent = "入力デバイスのポーリングレートを上げるなら、それを捌くCPUの余力が必須となる。";
    } 
    // 31-40: 覇者フェーズ
    else {
      const titles = [
        "家具解禁：昇降デスクという名の武器",
        "エルゴノミクス：身体と演算機の同期",
        "専用アース工事：電位差ゼロの追求",
        "防音空調：静寂こそが集中力を生む",
        "UPS導入：雷という天災からの防衛",
        "冗長性：同一スペック予備PCの意義",
        "部屋の温度管理：24時間20度設定の掟",
        "プログレード電力：単相200Vの世界",
        "環境の完成：演算要塞の最終確認",
        "覇者の称号：100万円の演算要塞"
      ];
      titleContent = titles[vol - 31] || "演算要塞への最終動員令";
      hintContent = "環境が整って初めて、演算機の性能は100%持続的に発揮される。";
    }

    return {
      volume: vol,
      title: `Vol.${vol}: ${titleContent}`,
      slug: `vol${vol}`,
      technicalHint: hintContent,
      isFurnitureUnlocked: vol >= 31
    };
  })
};