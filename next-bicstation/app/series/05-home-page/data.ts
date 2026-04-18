export interface DevGuideItem {
  vol: number;
  title: string;
  description: string;
  category: "初級編" | "中級編" | "上級編";
  tags: string[];
}

export const DEV_GUIDE_DATA: DevGuideItem[] = [
  // --- 初級編: 開発環境とNext.jsの基礎 ---
  { vol: 1, title: "モダン開発の全体像：なぜPython+Next.jsか", description: "このサイトが採用する技術スタックの選定理由。高速な表示と高度なAI処理を両立する論理。", category: "初級編", tags: ["Architecture", "Next.js"] },
  { vol: 2, title: "VSCodeを最強の武器にするカスタマイズ", description: "プログラミングは道具から。拡張機能、ショートカット、AI補完（Copilot）の徹底設定。", category: "初級編", tags: ["VSCode", "Setup"] },
  { vol: 3, title: "Node.jsとパッケージ管理の基礎知識", description: "npm/pnpm/yarn。フロントエンド開発を支えるライブラリ管理の仕組みを理解する。", category: "初級編", tags: ["Node.js", "npm"] },
  { vol: 4, title: "Next.js (App Router) の構造を解剖する", description: "このサイトのディレクトリ構造を例に、最新のNext.jsがどう動いているのかを解説。", category: "初級編", tags: ["Next.js", "AppRouter"] },
  { vol: 5, title: "Tailwind CSS：デザインをロジックで構築する", description: "CSSを書かずに、美しくレスポンシブなUIを爆速で組み上げるモダンなスタイル手法。", category: "初級編", tags: ["CSS", "Tailwind"] },
  { vol: 6, title: "TypeScript入門：バグを未然に防ぐ型安全の力", description: "JavaScriptに「厳格さ」を。大規模開発でも破綻しないための型定義の基本。", category: "初級編", tags: ["TypeScript", "Types"] },
  { vol: 7, title: "Git/GitHub：コードのタイムマシンと共有", description: "変更履歴を完璧に管理し、世界中の開発者と連携するための必須コマンドとワークフロー。", category: "初級編", tags: ["Git", "GitHub"] },
  { vol: 8, title: "Reactコンポーネントの設計思想", description: "再利用可能な部品をどう作るか。このサイトのカードやボタンのソースコードを公開。", category: "初級編", tags: ["React", "DesignSystem"] },
  { vol: 9, title: "API通信の基本：フロントとバックを繋ぐ", description: "fetch/axiosを使い、外部データやPythonサーバーから情報を取得する流れを学ぶ。", category: "初級編", tags: ["API", "Frontend"] },
  { vol: 10, title: "初級編総括：Hello Worldを超えた実戦環境", description: "自力でモダンなフロントエンドの土台を立ち上げられる状態をゴールにする。", category: "初級編", tags: ["Summary"] },

  // --- 中級編: PythonロジックとAI連携 ---
  { vol: 11, title: "Pythonサーバー（FastAPI）の構築", description: "Next.jsの裏側で動く、軽量かつ高速なPythonバックエンドの作り方。", category: "中級編", tags: ["Python", "FastAPI"] },
  { vol: 12, title: "AIモデルとのAPI連携（OpenAI/Claude）", description: "プログラムからAIを呼び出す。動的に回答を生成し、サイトのコンテンツに変える技術。", category: "中級編", tags: ["AI", "API"] },
  { vol: 13, title: "ローカルLLMをプログラムで制御する", description: "第3章で立てたOllama等を、Python経由で操作してプライベートなAI処理を行う。", category: "中級編", tags: ["LocalLLM", "Python"] },
  { vol: 14, title: "データベース統合：Supabase/PostgreSQL", description: "記事データやユーザー設定をどこに保存するか。モダンなDBの設計と接続。", category: "中級編", tags: ["Database", "Supabase"] },
  { vol: 15, title: "Pythonによる自動記事生成パイプライン", description: "ネタの収集から下書き、バリデーションまでをPythonで自動化する裏側の仕組み。", category: "中級編", tags: ["Automation", "Python"] },
  { vol: 16, title: "画像処理と最適化：PillowとNext/Image", description: "サーバー側で画像を加工し、フロント側で最適に表示する、視覚情報のハンドリング。", category: "中級編", tags: ["Images", "Optimization"] },
  { vol: 17, title: "Markdown/MDXのパースとレンダリング", description: "このサイトの記事はどう表示されているのか。MDXによる柔軟な記事執筆システム。", category: "中級編", tags: ["MDX", "Markdown"] },
  { vol: 18, title: "サーバーサイドレンダリング(SSR)の利点", description: "SEOに強く、読み込みが速いサイトを作るためのレンダリング戦略の最適解。", category: "中級編", tags: ["SEO", "Performance"] },
  { vol: 19, title: "認証システムの実装：NextAuth.js", description: "ログイン機能はどう作るのか。セキュアな会員制エリアの構築方法。", category: "中級編", tags: ["Auth", "Security"] },
  { vol: 20, title: "中級編総括：ロジックとデータが循環する仕組み", description: "フロントからバックエンド、DBまでが一気通貫で繋がった状態。", category: "中級編", tags: ["Summary"] },

  // --- 上級編: サイトの実装暴露とデプロイ ---
  { vol: 21, title: "【暴露】このサイトのディレクトリ構造 全公開", description: "一切の隠し事なし。実プロジェクトのファイル構成から設計の意図までを全解剖。", category: "上級編", tags: ["Project", "Inside"] },
  { vol: 22, title: "VercelへのデプロイとCI/CD環境", description: "コードをプッシュするだけで世界に公開される。自動デプロイの快適な環境構築。", category: "上級編", tags: ["Vercel", "CICD"] },
  { vol: 23, title: "VPS（SHIN-VPS）でのセルフホスティング", description: "Vercelに頼らない選択肢。自前サーバーでPythonロジックを常駐させる高度な運用。", category: "上級編", tags: ["VPS", "Hosting"] },
  { vol: 24, title: "パフォーマンス計測とLighthouseの改善", description: "サイトの速度を数値化し、ボトルネックを潰していくプロの最適化テクニック。", category: "上級編", tags: ["Performance", "WebPerf"] },
  { vol: 25, title: "エラー監視とログ管理の自動化", description: "バグをいち早く察知する。Sentry等のツールを使った運用の自動化。", category: "上級編", tags: ["Monitoring", "Sentry"] },
  { vol: 26, title: "AIエージェントによるコード自動レビュー", description: "自分が書いたコードをAIにチェックさせ、品質を保つための開発フロー。", category: "上級編", tags: ["AI", "Review"] },
  { vol: 27, title: "SEO戦略の実装：メタデータとサイトマップ", description: "検索エンジンに好かれるためのプログラム。動的なOGP画像生成の裏側。", category: "上級編", tags: ["SEO", "Metadata"] },
  { vol: 28, title: "スケーラビリティと将来の拡張性", description: "100記事、1000記事と増えても重くならない、論理的なコード設計のコツ。", category: "上級編", tags: ["Architecture", "Design"] },
  { vol: 29, title: "プログラミングが変える『世界の見え方』", description: "コードが書けるようになると、世の中のサービスがどう作られているか全て理解できる。", category: "上級編", tags: ["Mindset", "Logic"] },
  { vol: 30, title: "第5章総括：クリエイターからデベロッパーへ", description: "道具を使いこなす段階から、自ら道具を生み出す段階へ。最終章、エンジニアへの道へ。", category: "上級編", tags: ["Summary", "GoToFinal"] }
];