/**
 * BICSTATION - BTO Masters Series Global Architecture
 * 44年の知見と、次世代への継承を込めた全9シリーズ
 */

// --- 型定義 (ビルドエラー防止のため必須) ---

export type BtoPhase = {
  budget: string;
  label: string;
  focus: string;
  environment: string;
};

export type BtoSeries = {
  id: string;
  title: string;
  concept: string;
  priorityDevice: string; // page.tsxで参照しているため必須
  phases: BtoPhase[];
};

// --- 実装データ ---

export const BTO_SERIES_CONFIG: Record<string, BtoSeries> = {
  // 1. 【BUILD】PCビルドの聖典
  build_logic: {
    id: "build_logic",
    title: "PCビルドの聖典：論理的最適解の構築",
    concept: "カタログスペックを排し、電気信号と熱力学の観点から「勝つパーツ」を選定する",
    priorityDevice: "マザーボード・電源（電力供給品質）",
    phases: [
      { budget: "¥100,000", label: "見習い工", focus: "最小演算構成の理解", environment: "帯電防止マット。最小構成起動。" },
      { budget: "¥250,000", label: "熟練工", focus: "VRM冷却と電源品質の相関", environment: "ベンチ台。パーツ個体差の選別。" },
      { budget: "¥500,000", label: "設計士", focus: "流体シミュレーションとカスタム水冷", environment: "独自の冷却回路構築。" },
      { budget: "¥1,000,000〜", label: "巨匠", focus: "極限オーバークロックと筐体切削", environment: "【解禁】加工用旋盤、超音波洗浄機。" }
    ]
  },

  // 2. 【OPERATION】機体運用マニュアル
  operation_mastery: {
    id: "operation_mastery",
    title: "機体運用マニュアル：ポテンシャルの120%解放",
    concept: "演算資源を1bitも無駄にしない。OSカーネルからネットワーク遅延までを支配する",
    priorityDevice: "OS・ネットワークインターフェース",
    phases: [
      { budget: "¥50,000", label: "操縦士", focus: "カーネル最適化と不要サービス停止", environment: "OS挙動の完全制御。" },
      { budget: "¥150,000", label: "分析官", focus: "ボトルネック可視化とUPS導入", environment: "監視ツール常駐。電力安定化。" },
      { budget: "¥400,000", label: "調律師", focus: "低遅延IRQ再構築と高速ネットワーク", environment: "10GbE。自動最適化スクリプト。" },
      { budget: "¥1,200,000〜", label: "統制官", focus: "完全冗長化と自動復旧システム", environment: "【解禁】サーバーラック、IPMI管理、NAS。" }
    ]
  },

  // 3. 【GAMING】極限低遅延BTO
  gaming: {
    id: "gaming",
    title: "極限低遅延BTO構築論",
    concept: "入力遅延をハードウェアで殺す。0.000001秒（1μs）を支配する戦術的ビルド",
    priorityDevice: "高リフレッシュレート・低遅延モニタ",
    phases: [
      { budget: "¥150,000", label: "守護者", focus: "CPUシングルコア性能 + 最速OS設定", environment: "有線LAN(Cat6A)固定。" },
      { budget: "¥300,000", label: "執行者", focus: "360Hz維持とGPU冷却強化", environment: "0.5ms応答モニタ。まだ椅子は買わない。" },
      { budget: "¥600,000", label: "賢者", focus: "ジッター排除とプログレード電力供給", environment: "定位感重視DAC/AMP。音の索敵最大化。" },
      { budget: "¥1,500,000〜", label: "覇者", focus: "理論値の完全支配とダウンタイムゼロ", environment: "【家具・200V解禁】専用アース、防音空調。" }
    ]
  },

  // 4. 【TRADING】トレーディング要塞
  trading: {
    id: "trading",
    title: "不確実性への絶対回答：トレーディング要塞",
    concept: "1ミリ秒の表示遅延とフリーズを「確定損失」と定義し、徹底排除する",
    priorityDevice: "マルチディスプレイ・UPS（無停電電源装置）",
    phases: [
      { budget: "¥180,000", label: "監視者", focus: "高品質マザーと電源による安定稼働", environment: "2画面。UPS先行導入。" },
      { budget: "¥400,000", label: "約定者", focus: "4画面出力とメモリ64GB以上", environment: "モニタアーム。水平垂直配置の最適化。" },
      { budget: "¥800,000", label: "裁定者", focus: "完全静音とストレージRAID冗長化", environment: "バックアップ回線(Starlink等)。" },
      { budget: "¥2,000,000〜", label: "支配者", focus: "サーバーグレード部品による365日稼働", environment: "【家具解禁】覇者の椅子、24h空調管理室。" }
    ]
  },

  // 5. 【BUSINESS】エグゼクティブ・ビルド
  business: {
    id: "business",
    title: "意思決定要塞：エグゼクティブ・ビジネス・ビルド",
    concept: "思考を妨げる『待ち時間』を排除。情報の視認性とデータ保護を極限まで高める",
    priorityDevice: "超高速NVMe SSD・ウルトラワイドモニタ",
    phases: [
      { budget: "¥120,000", label: "実務家", focus: "高速NVMe SSDとExcelフリーズ対策", environment: "アプリ瞬時起動。既存デスク。" },
      { budget: "¥250,000", label: "統括者", focus: "多コアCPUと静音性による集中維持", environment: "ウルトラワイドモニタ。資料並列閲覧。" },
      { budget: "¥600,000", label: "経営者", focus: "ECCメモリとRAID1(データ絶対保護)", environment: "昇降デスク。4Kマルチ画面。演算力。" },
      { budget: "¥1,500,000〜", label: "支配者", focus: "完全冗長化電源と物理セキュリティ", environment: "【家具解禁】最高級チェア、秘匿書斎。" }
    ]
  },

  // 6. 【CREATIVE】無限創造
  creative: {
    id: "creative",
    title: "無限創造：次世代クリエイティブ・ビルド",
    concept: "スループットを最大化し、クリエイターの『情熱の鮮度』を維持する工場",
    priorityDevice: "大容量メモリ・カラーマネジメントモニタ",
    phases: [
      { budget: "¥200,000", label: "表現者", focus: "大容量メモリと高速スクラッチディスク", environment: "読み書きストレス皆無。" },
      { budget: "¥500,000", label: "演出家", focus: "Ryzen 9級多コアとモニタースピーカー", environment: "プレビュー用サブモニタ導入。" },
      { budget: "¥1,000,000", label: "創造主", focus: "VRAM 24GB以上とキャリブレーション", environment: "カラーマネジメント(EIZO等)絶対化。" },
      { budget: "¥2,500,000〜", label: "革新者", focus: "AI学習・8Kレンダリング特化", environment: "【家具解禁】10GbE NAS、マルチモニタ要塞。" }
    ]
  },

  // 7. 【AI_DEV】知能創造（AIエンジニアリング）
  ai_dev: {
    id: "ai_dev",
    title: "知能創造：AI開発・推論ワークステーション",
    concept: "VRAM容量こそが知能の境界線。パラメータ数をハードウェアで解決する",
    priorityDevice: "NVIDIA RTX 24GB VRAM以上（GPU）",
    phases: [
      { budget: "¥300,000", label: "解析者", focus: "16GB VRAMとDDR5高速メモリ", environment: "Ubuntu/WSL2。ローカルLLM構築。" },
      { budget: "¥600,000", label: "学習者", focus: "24GB VRAM単体とNVMe RAID", environment: "冷却重視メッシュケース。熱対策徹底。" },
      { budget: "¥1,500,000", label: "開拓者", focus: "マルチGPU(VRAM 48GB+)と大容量電源", environment: "10GbE。中規模モデル学習。" },
      { budget: "¥4,000,000〜", label: "特異点", focus: "エンタープライズGPU(A100/H100)導入", environment: "【解禁】200V電源、サーバーラック。" }
    ]
  },

  // 8. 【SCIENCE】真理演算
  science: {
    id: "science",
    title: "真理演算：学術解析・シミュレーション・ビルド",
    concept: "物理演算の『解』を、純粋な浮動小数点演算能力で導き出す真理への道",
    priorityDevice: "Threadripper / Xeon（多コアCPU）",
    phases: [
      { budget: "¥250,000", label: "観測者", focus: "高クロックCPUとメモリ帯域の最大化", environment: "大量データ高速処理基盤。" },
      { budget: "¥500,000", label: "分析者", focus: "AVX-512対応とECCメモリ", environment: "計算エラーの物理的排除。" },
      { budget: "¥1,200,000", label: "数理者", focus: "HPC向けマルチGPUと持続冷却", environment: "研究室レベル静音。自動停止システム。" },
      { budget: "¥3,500,000〜", label: "予言者", focus: "マルチCPU(Threadripper PRO等)", environment: "【解禁】専用計算室、耐震ラック。" }
    ]
  },

  // 9. 【STREAMING】共鳴要塞
  streaming: {
    id: "streaming",
    title: "共鳴要塞：次世代ライブストリーミング・ビルド",
    concept: "エンコード負荷を完完封し、配信者の『感情のラグ』をゼロにする",
    priorityDevice: "配信用エンコーダ（GPU）とオーディオインターフェース",
    phases: [
      { budget: "¥200,000", label: "伝達者", focus: "AV1対応GPUとスタジオマイク", environment: "ノイズのない入力経路確保。" },
      { budget: "¥450,000", label: "共感者", focus: "2PC配信構成と背景ライティング", environment: "防音マット。Stream Deck導入。" },
      { budget: "¥900,000", label: "調律者", focus: "物理ミキサーとスタジオカメラ", environment: "グリーンバック。専用照明。" },
      { budget: "¥2,000,000〜", label: "伝説", focus: "完全冗長化配信システム", environment: "【解禁】完全防音室、専用光回線。" }
    ]
  }
};