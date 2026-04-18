export interface AIGuideItem {
  vol: number;
  title: string;
  description: string;
  category: "初級編" | "中級編" | "上級編";
  tags: string[];
}

export const AI_GUIDE_DATA: AIGuideItem[] = [
  // --- 初級編: CopilotとAI対話の基礎 ---
  { vol: 1, title: "AI時代の『知的加速』：人間は何をすべきか", description: "AIを単なるツールから「相棒」へ。これからの10年を生き抜くためのAI共生思考と、生産性が加速するトップスピードの正体。", category: "初級編", tags: ["AI", "Mindset"] },
  { vol: 2, title: "Microsoft Copilot完全攻略：OSレベルの革新", description: "Windowsに標準搭載されたAIが、日々のファイル操作や検索、作業プロセスをどう劇的に速めるのかを徹底解説。", category: "初級編", tags: ["Copilot", "Windows"] },
  { vol: 3, title: "対話の論理：プロンプトエンジニアリング基礎", description: "指示の出し方一つで結果が変わる。AIに意図を正確に伝え、最高精度の回答を引き出すための論理的指示構造。", category: "初級編", tags: ["Prompt", "Basics"] },
  { vol: 4, title: "クラウドAIの限界と進化：Copilotの役割", description: "クラウド側で処理されるAIの利便性と、近年加速する処理速度。日常作業における「リアルタイムAIアシスタント」の価値。", category: "初級編", tags: ["CloudAI", "Copilot"] },
  { vol: 5, title: "ChatGPT・Claude・Geminiの徹底使い分け術", description: "文章作成、コーディング、創造的議論。各LLM（大規模言語モデル）の特性を理解し、最短距離で成果を出す選択術。", category: "初級編", tags: ["LLM", "Review"] },
  { vol: 6, title: "AIによる情報の要約とナレッジベース構築", description: "大量のドキュメントをCopilotで瞬時に要約。第2章で学んだ情報の整理術を、AIの力で数倍に加速させる方法。", category: "初級編", tags: ["Efficiency", "Copilot"] },
  { vol: 7, title: "画像生成AI：プロンプトで視覚情報を支配する", description: "DALL-E 3やMidjourneyを活用。言葉から高品質なビジュアルを生成し、ブログや動画の素材作りを自動化する。", category: "初級編", tags: ["ImageGen", "Design"] },
  { vol: 8, title: "AIセキュリティ：情報を守りながら恩恵を受ける", description: "機密情報をクラウドに投げるリスクと対策。企業のCopilot利用でも重要視されるプライバシー保護のガイドライン。", category: "初級編", tags: ["Security", "Privacy"] },
  { vol: 9, title: "マルチデバイスAI活用：スマホとPCの同期", description: "PCの前にいない時こそAIの出番。音声入力による思考の即時記録と、クラウドAIによるデバイスを跨いだ知的連携。", category: "初級編", tags: ["Mobile", "Cloud"] },
  { vol: 10, title: "初級編総括：AIが脳の外部ユニットになる日", description: "Copilotと対話が日常に溶け込んだ状態を定義。次なるステップ「ローカル演算」へのマインドセット構築。", category: "初級編", tags: ["Summary"] },

  // --- 中級編: GPU活用とローカルLLM ---
  { vol: 11, title: "ローカルLLMの逆襲：なぜ『自前』が必要か", description: "クラウドへの依存を断ち切る。オフライン、検閲なし、究極のプライバシーを確保した自分専用AIの構築意義。", category: "中級編", tags: ["LocalLLM", "Privacy"] },
  { vol: 12, title: "NVIDIA GPUとVRAM：AI加速の物理的土台", description: "ハードウェア編の知識を深化。なぜAIには高いVRAMが必要なのか、GPU性能がAIの「思考速度」に与える影響。", category: "中級編", tags: ["GPU", "Hardware"] },
  { vol: 13, title: "GPU vs クラウドAI：現実的なコスト・速度比較", description: "月額サブスクリプションか、初期投資でGPUを買うか。数年スパンで見た「知的演算」のコストパフォーマンス論。", category: "中級編", tags: ["GPU", "Cloud"] },
  { vol: 14, title: "LM Studio / Ollama：ローカルLLMの簡単導入", description: "難解な環境構築をスキップ。GUIツールで数分以内に自分のPC内で最新のLLMを稼働させる実戦手順。", category: "中級編", tags: ["Setup", "Ollama"] },
  { vol: 15, title: "Python超入門：AIを制御するコマンドライン", description: "コードを書くのではなく、AIにコードを書かせるための共通言語。環境構築（Anaconda/VSCode）と基本作法。", category: "中級編", tags: ["Python", "Setup"] },
  { vol: 16, title: "データ解析の革命：Pandasによる高速処理", description: "Excelでは不可能な巨大データをPythonで解析。AIにデータの「意味」を抽出させ、意思決定を加速させる。", category: "中級編", tags: ["DataAnalysis", "Python"] },
  { vol: 17, title: "RAG：自分のPDFやメモをAIに学習させる", description: "「検索拡張生成」の実装。第2章で蓄積したObsidianやNotionのデータを、AIの回答ソースとして統合する技術。", category: "中級編", tags: ["RAG", "Knowledge"] },
  { vol: 18, title: "Dify：ノーコードでAIワークフローをデザイン", description: "複数のAIモデルとWeb検索、ファイル処理を視覚的に繋ぎ、高度な自動化エージェントを自作する手法。", category: "中級編", tags: ["Dify", "NoCode"] },
  { vol: 19, title: "ローカル画像生成（Stable Diffusion）の深化", description: "自前GPUのパワーを解放し、著作権的にクリーンな独自モデルを運用。画像生成にかかる待ち時間をゼロにする設定。", category: "中級編", tags: ["SD", "GPU"] },
  { vol: 20, title: "中級編総括：ローカル知能による完全な独立", description: "クラウドが止まっても、情報が漏れても、あなたのPC内には最強の知能が生き続ける環境の完成。", category: "中級編", tags: ["Summary"] },

  // --- 上級編: Python解析と知的自動化 ---
  { vol: 21, title: "AIエージェント：自律的に問題を解決する", description: "指示を待つAIから、目標を与えれば自分で考え、ツールを使い、完遂する自律型エージェントの構築。", category: "上級編", tags: ["AI_Agent", "Future"] },
  { vol: 22, title: "PythonによるWeb自動調査とAIレポーティング", description: "ネット上の最新情報をスクレイピングし、AIが分析・要約して自分に最適なニュースレターを送る仕組み。", category: "上級編", tags: ["Python", "Automation"] },
  { vol: 23, title: "API連携による知的業務のパイプライン化", description: "情報の入力をトリガーに、AIが加工し、SNS投稿やブログ公開までを自動で完結させる「自動発信機」の設計。", category: "上級編", tags: ["API", "Integration"] },
  { vol: 24, title: "GitHubと連携したAI駆動のツール開発", description: "AIをリードエンジニアとして雇い、自分の欲しかったデスクトップツールやWebアプリを自作・管理する流れ。", category: "上級編", tags: ["GitHub", "Dev"] },
  { vol: 25, title: "動画・音声生成AIの統合ワークフロー", description: "台本、ナレーション、映像生成。第2章のYouTube発信を、AIエージェントの力で数倍の頻度へ引き上げる実験。", category: "上級編", tags: ["VideoGen", "Auto"] },
  { vol: 26, title: "パーソナルAIの微調整（Fine-Tuning）", description: "（概念と実践）自分の過去の発信や思考をAIに教え込み、自分の「文体」や「判断基準」を持つ分身を作る方法。", category: "上級編", tags: ["FineTuning", "Future"] },
  { vol: 27, title: "スマートホーム×AI：インフラを統べる知能", description: "ハードウェア編で構築したMatter/Thread環境をローカルAIで制御。センサーと対話し、環境を予測制御する家。", category: "上級編", tags: ["EdgeAI", "SmartHome"] },
  { vol: 28, title: "AI時代の防衛論：フェイクを見抜く技術", description: "ディープフェイクやAI詐欺が蔓延する時代。技術を理解しているからこそできる、真偽の検証と自己防衛の論理。", category: "上級編", tags: ["Security", "Ethics"] },
  { vol: 29, title: "汎用人工知能（AGI）への備えと未来予測", description: "2030年、その先へ。人類の演算能力が加速したその先に待ち受ける、新しい生活様式と価値観の転換点。", category: "上級編", tags: ["AGI", "Future"] },
  { vol: 30, title: "全章総括：ハード・ソフト・知能の最終統合", description: "全90講の結び。最強の物理環境、磨かれた表現力、そしてAIという翼を手に、あなたの新しい物語が始まる。", category: "上級編", tags: ["Final", "Integration"] }
];