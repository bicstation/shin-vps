// BTO Masters Series - Global Architecture Specification
// 44年の知見に基づく「演算機本体優先」の設計思想を定義

export type BtoPhase = {
  volRange: [number, number];
  label: string;
  focus: string; // 何に予算を投下するか
  environment: string; // 環境構築の範囲
};

export type BtoSeries = {
  title: string;
  concept: string;
  priorityDevice: string; // 本体以外で唯一優先するデバイス
  phases: BtoPhase[];
};

export const BTO_SERIES_CONFIG: Record<string, BtoSeries> = {
  // 🎮 ゲーミング：0.000001秒の領域
  gaming: {
    title: "極限低遅延BTO構築論",
    concept: "予算を本体演算ユニットへ全振りし、入力遅延をパッドで殺す",
    priorityDevice: "高性能ゲーミングパッド（ホールエフェクトセンサー等）",
    phases: [
      { 
        volRange: [1, 10], 
        label: "守護者（初級：10万）", 
        focus: "本体の基礎演算能力 + 標準パッド",
        environment: "既存の机・椅子を流用。まずは『動く』ことより『カクつかない』こと。"
      },
      { 
        volRange: [11, 20], 
        label: "執行者（中級：20万）", 
        focus: "高フレームレート維持 + カスタムパッド",
        environment: "モニターの更新。リフレッシュレートの同期を優先。"
      },
      { 
        volRange: [21, 30], 
        label: "賢者（上級：30万）", 
        focus: "ジッター排除 + プログレードパッド",
        environment: "オーディオ（定位感）の追加。まだ家具には手を出さない。"
      },
      { 
        volRange: [31, 40], 
        label: "覇者（極致：50万〜100万超）", 
        focus: "理論値の完全所有 + 予備パッド",
        environment: "【解禁】専用電源、エルゴノミクス家具、防音室。究極の演算要塞化。"
      },
    ]
  },

  // 📈 トレーディング：不確実性への絶対回答
  trading: {
    title: "不確実性への絶対回答：トレーディング要塞",
    concept: "1ミリ秒の表示遅延とフリーズを「損失」と定義し、排除する",
    priorityDevice: "多画面出力同期インターフェース / 高速NIC",
    phases: [
      { volRange: [1, 10], label: "監視者（初級：10万）", focus: "本体の安定稼働 + 2画面", environment: "一般的なデスク" },
      { volRange: [11, 20], label: "約定者（中級：20万）", focus: "4画面マルチ + ネットワーク最適化", environment: "モニターアーム導入" },
      { volRange: [21, 30], label: "裁定者（上級：30万）", focus: "6画面以上 + 無停電電源(UPS)", environment: "バックアップ回線の確保" },
      { volRange: [31, 40], label: "支配者（極致：50万〜）", focus: "完全冗長化システム", environment: "【解禁】24時間稼働専用ルーム / 覇者の椅子" },
    ]
  },

  // 🎨 クリエイティブ：想像を具現化する工場
  creative: {
    title: "無限創造：次世代クリエイティブ・ビルド",
    concept: "スループット（処理量）を最大化し、クリエイターの『待ち時間』をゼロにする",
    priorityDevice: "左手デバイス / 高精度ペンタブレット",
    phases: [
      { volRange: [1, 10], label: "表現者（初級：10万）", focus: "メインメモリ容量重視（絵本・イラスト）", environment: "標準環境" },
      { volRange: [11, 20], label: "演出家（中級：20万）", focus: "CPU多コア + 音楽/動画プレビュー", environment: "スピーカー/ヘッドホン" },
      { volRange: [21, 30], label: "創造主（上級：30万）", focus: "VRAM 24GB + 高速ストレージ", environment: "カラーマネジメントモニター" },
      { volRange: [31, 40], label: "革新者（極致：50万〜）", focus: "AI学習・8Kレンダリング要塞", environment: "【解禁】大容量NAS / 長時間作業用最高級デスク" },
    ]
  }
};