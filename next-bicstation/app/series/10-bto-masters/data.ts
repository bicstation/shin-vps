/**
 * BTO Masters Series - Global Architecture Specification
 * 44年の知見に基づく「演算機本体優先」の設計思想を定義
 */

export type BtoPhase = {
  volRange: [number, number];
  label: string;
  focus: string; // 何に予算を投下するか
  environment: string; // 環境構築の範囲
};

export type BtoSeries = {
  id: string;
  title: string;
  concept: string;
  priorityDevice: string; // 本体以外で唯一優先するデバイス
  phases: BtoPhase[];
};

export interface Episode {
  volume: number;
  title: string;
  slug: string;
  technicalHint: string;
  isFurnitureUnlocked: boolean;
}

export const BTO_SERIES_CONFIG: Record<string, BtoSeries> = {
  // 🎮 ゲーミング：0.000001秒（1マイクロ秒）を支配する領域
  gaming: {
    id: "gaming",
    title: "極限低遅延BTO構築論",
    concept: "予算を本体演算ユニットへ全振りし、入力遅延をハードウェアで殺す",
    priorityDevice: "高性能ゲーミングパッド（ポーリングレート1000Hz以上/ホールエフェクト）",
    phases: [
      { 
        volRange: [1, 10], 
        label: "守護者（初級：15万）", 
        focus: "CPUシングルコア性能 + 最速最小構成OS設定", 
        environment: "既存デスク。通信環境を有線LAN(Cat6A以上)へ完全固定。" 
      },
      { 
        volRange: [11, 20], 
        label: "執行者（中級：30万）", 
        focus: "高リフレッシュレート(240Hz+)維持 + GPU冷却強化", 
        environment: "0.5ms以下のゲーミングモニター導入。まだ椅子は買わない。" 
      },
      { 
        volRange: [21, 30], 
        label: "賢者（上級：50万）", 
        focus: "ジッター排除（安定したフレームタイム） + プログレード電力供給", 
        environment: "定位感重視のDAC/AMP導入。音による索敵能力を最大化。" 
      },
      { 
        volRange: [31, 40], 
        label: "覇者（極致：100万〜）", 
        focus: "理論値の完全支配 + 予備パーツによるダウンタイムゼロ化", 
        environment: "【家具・電源解禁】専用アース工事、最高級デスク、防音空調。" 
      },
    ]
  },

  // 📈 トレーディング：不確実性を演算でねじ伏せる要塞
  trading: {
    id: "trading",
    title: "不確実性への絶対回答：トレーディング要塞",
    concept: "1ミリ秒の表示遅延とフリーズを「確定損失」と定義し、徹底排除する",
    priorityDevice: "多画面出力同期インターフェース / 高速NIC（Intel I225-V以上推奨）",
    phases: [
      { 
        volRange: [1, 10], 
        label: "監視者（初級：15万）", 
        focus: "本体の安定稼働（高品質電源・マザーボード）+ 2画面", 
        environment: "一般的なデスク。UPS（無停電電源装置）の先行導入。" 
      },
      { 
        volRange: [11, 20], 
        label: "約定者（中級：35万）", 
        focus: "4画面マルチ出力 + メモリの大容量化（64GB以上）", 
        environment: "モニターアームによる垂直・水平配置의最適化。" 
      },
      { 
        volRange: [21, 30], 
        label: "裁定者（上級：60万）", 
        focus: "完全静音化 + 高速ストレージ（RAID1等での冗長化）", 
        environment: "バックアップ回線（Starlink等）の確保。疲労軽減用フットレスト。" 
      },
      { 
        volRange: [31, 40], 
        label: "支配者（極致：120万〜）", 
        focus: "サーバーグレードコンポーネントによる24時間365日稼働", 
        environment: "【家具解禁】覇者の椅子、24時間稼働専用ルーム、温度管理システム。" 
      },
    ]
  },

  // 💼 ビジネス・マネジメント：意思決定の高速化
  business: {
    id: "business",
    title: "意思決定要塞：エグゼクティブ・ビジネス・ビルド",
    concept: "思考を妨げる『待ち時間』と『不安定』を排除し、情報の視認性を極限まで高める",
    priorityDevice: "高耐久・静音メカニカルキーボード / 4Kウルトラワイドモニター",
    phases: [
      { 
        volRange: [1, 10], 
        label: "実務家（初級：12万）", 
        focus: "高速NVMe SSD + 16GB以上のメモリ（Excelフリーズ対策）", 
        environment: "既存デスク。まずはアプリ起動とファイル展開のストレスを皆無にする。" 
      },
      { 
        volRange: [11, 20], 
        label: "統括者（中級：25万）", 
        focus: "マルチタスク用CPU多コア化 + 静音性重視のケース・ファン", 
        environment: "ウルトラワイドモニター導入。資料を横並びで閲覧できる環境を構築。" 
      },
      { 
        volRange: [21, 30], 
        label: "経営者（上級：50万）", 
        focus: "ECCメモリ + RAID1（データ保護）+ 高品質Web会議用カメラ/マイク", 
        environment: "昇降デスク、4Kマルチ画面。オンライン会議中も裏で集計を回せる演算力。" 
      },
      { 
        volRange: [31, 40], 
        label: "支配者（極致：100万〜）", 
        focus: "完全冗長化電源 + 物理セキュリティ強化ケース", 
        environment: "【家具解禁】最高級オフィスチェア、秘匿性の高い書斎、専用高速回線。" 
      },
    ]
  },

  // 🎨 クリエイティブ：想像の出力を妨げない工場
  creative: {
    id: "creative",
    title: "無限創造：次世代クリエイティブ・ビルド",
    concept: "スループットを最大化し、クリエイターの『待ち時間』をゼロにする",
    priorityDevice: "左手デバイス / 高精度カラーマネジメント・キャリブレーター",
    phases: [
      { 
        volRange: [1, 10], 
        label: "表現者（初級：20万）", 
        focus: "メインメモリ容量重視 + 高速M.2 NVMe SSD", 
        environment: "標準環境。まずはデータの読み書きでストレスを溜めない。" 
      },
      { 
        volRange: [11, 20], 
        label: "演出家（中級：45万）", 
        focus: "多コアCPU(Ryzen 9等) + プレビュー用サブモニター", 
        environment: "正確な音響モニタースピーカーの導入。" 
      },
      { 
        volRange: [21, 30], 
        label: "創造主（上級：80万）", 
        focus: "VRAM 24GB以上(RTX 4090等) + Thunderboltハブ", 
        environment: "カラーマネジメントモニター(EIZO等)による色彩の絶対化。" 
      },
      { 
        volRange: [31, 40], 
        label: "革新者（極致：150万〜）", 
        focus: "AI学習・8Kレンダリング特化構成 / 10GbE NAS連携", 
        environment: "【家具解禁】長時間作業用昇降デスク、4Kマルチディスプレイ要塞。" 
      },
    ]
  },

  // 🤖 AIエンジニアリング：知能の局在化
  ai_dev: {
    id: "ai_dev",
    title: "知能創造：AI開発・推論ワークステーション",
    concept: "VRAM容量こそが知能の限界値。パラメータ数をハードウェアで解決する",
    priorityDevice: "物理キーボード（静電容量無接点方式）/ Linuxネイティブ環境",
    phases: [
      { 
        volRange: [1, 10], 
        label: "解析者（初級：25万）", 
        focus: "16GB以上のVRAM + 高速メインメモリ(DDR5)", 
        environment: "開発用OS(Ubuntu/WSL2)の構築。まずはLLMをローカルで動かす。" 
      },
      { 
        volRange: [11, 20], 
        label: "学習者（中級：50万）", 
        focus: "24GB VRAM(単体) + 大容量データセット用NVMe RAID", 
        environment: "冷却性能重視のメッシュケース導入。サーマルスロットリングの徹底排除。" 
      },
      { 
        volRange: [21, 30], 
        label: "開拓者（上級：120万）", 
        focus: "マルチGPU構成(VRAM 48GB+) + 1500Wプラチナ電源", 
        environment: "10GbE高速ネットワークによるデータ転送の最適化。" 
      },
      { 
        volRange: [31, 40], 
        label: "特異点（極致：300万〜）", 
        focus: "エンタープライズGPU(A100/H100級)の導入", 
        environment: "【解禁】200V電源工事、サーバーラック、静音ラックケース。" 
      },
    ]
  },

  // 🧪 サイエンス：真理の演算
  science: {
    id: "science",
    title: "真理演算：学術解析・シミュレーション・ビルド",
    concept: "物理演算と多変数解析の『解』を、純粋な浮動小数点演算能力で導き出す",
    priorityDevice: "大容量外部バックアップシステム / 数式入力用ペンタブレット",
    phases: [
      { 
        volRange: [1, 10], 
        label: "観測者（初級：20万）", 
        focus: "高クロックCPU + メモリ帯域(Quad Channel等)の確保", 
        environment: "標準環境。大量のCSVや論文データを高速処理する基盤。" 
      },
      { 
        volRange: [11, 20], 
        label: "分析者（中級：40万）", 
        focus: "AVX-512等命令セット対応CPU + ECCメモリ(32GB+)", 
        environment: "計算エラーを許さないハードウェア構成。デュアルモニター環境。" 
      },
      { 
        volRange: [21, 30], 
        label: "数理者（上級：100万）", 
        focus: "HPC向けマルチGPU + 液冷による持続的フルロード維持", 
        environment: "研究室レベルの静音化。UPSと自動シャットダウンシステムの構築。" 
      },
      { 
        volRange: [31, 40], 
        label: "予言者（極致：250万〜）", 
        focus: "ワークステーション用マルチCPU(Threadripper PRO等)", 
        environment: "【解禁】専用計算サーバー室、高速インターコネクト、耐震ラック。" 
      },
    ]
  },

  // 🎙️ プロ配信・オーディオ：無劣化の共鳴
  streaming: {
    id: "streaming",
    title: "共鳴要塞：次世代ライブストリーミング・ビルド",
    concept: "エンコード負荷をハードウェアで完封し、配信者の『感情のラグ』をゼロにする",
    priorityDevice: "オーディオインターフェース / スタジオグレードマイク",
    phases: [
      { 
        volRange: [1, 10], 
        label: "伝達者（初級：20万）", 
        focus: "AV1エンコード対応GPU + 安定したCPUマルチスレッド性能", 
        environment: "マイクアーム、ポップガード。ノイズのない入力経路の確保。" 
      },
      { 
        volRange: [11, 20], 
        label: "共感者（中級：40万）", 
        focus: "配信専用PCとの2PC構成（または超多コア1PC）", 
        environment: "防音マット、背景ライティング、Elgato Stream Deck導入。" 
      },
      { 
        volRange: [21, 30], 
        label: "調律者（上級：80万）", 
        focus: "無劣化映像キャプチャ + 物理ミキサー連携", 
        environment: "スタジオカメラ、グリーンバック、専用照明システム。" 
      },
      { 
        volRange: [31, 40], 
        label: "伝説（極致：150万〜）", 
        focus: "完全冗長化配信システム（メイン・サブの同時エンコード）", 
        environment: "【解禁】完全防音室、専用光回線、エアコン静音改修。" 
      },
    ]
  }
};