// /home/maya/shin-dev/shin-vps/next-bicstation/app/series/00-master-log/data.ts

export const GUIDE_STRUCTURE = {
  bto: {
    id: "bto",
    title: "物理要塞：1円あたりの演算密度を最大化し、家全体をPCにする",
    concept: "カタログスペックの『嘘』を暴き、基盤からネットワーク、電力系統までを一つのエコシステムとして統合する。",
    priorityDevice: "国内BTOデスクトップ・10GbEインフラ・V2H・Matter対応デバイス",
    phases: [
      {
        budget: "¥150,000〜¥299,999",
        label: "第1段階：基礎・国内BTOパソコンの最適選定（初級編）",
        focus: "失敗しないメーカー選びと、ボトルネックのない論理的パーツ構成の習得",
        environment: "一般家庭・クリエイティブ入門環境。1G環境。",
        episodes: [
          { ep: 1, title: "14歳から見続けたPCの本質：スペック表の『嘘』と『真実』" },
          { ep: 2, title: "演算密度の設計：CPU/GPU選定における論理的最適解" },
          { ep: 3, title: "インフラの品質：マザーボードと電源ユニットの選び方" },
          { ep: 4, title: "BTOカスタマイズの急所：削るべきパーツ、盛るべきパーツ" },
          { ep: 5, title: "静音と冷却の両立：エアフローを支配する物理セットアップ" },
          { ep: 6, title: "マウスコンピューター DAIV/G-Tune攻略：クリエイターの視点" },
          { ep: 7, title: "パソコン工房・ドスパラ徹底比較：コスパ最大化のロジック" },
          { ep: 8, title: "記憶の階層：DDR5とNVMe Gen5がもたらす体験の変革" },
          { ep: 9, title: "視神経の拡張：モニターとインターフェースの人間工学" },
          { ep: 10, title: "【到達】健康診断：届いた後の初期設定と限界負荷試験プロトコル" }
        ]
      },
      {
        budget: "¥300,000〜¥999,999",
        label: "第2段階：応用・世界シェアメーカーと小型筐体の攻略（中級編）",
        focus: "グローバルメーカーの調達力活用と、用途に応じた筐体サイズの最適化",
        environment: "マルチデバイス・プロフェッショナル作業室。省電力サーバー環境。",
        episodes: [
          { ep: 11, title: "世界3大メーカー（DELL/HP/Lenovo）の設計思想と調達力" },
          { ep: 12, title: "DELL XPS/Alienware解析：プレミアムモデルの真価" },
          { ep: 13, title: "HP Z/ENVYシリーズ：ワークステーション級の安定性" },
          { ep: 14, title: "Lenovo ThinkCentre/ThinkStation：保守性と堅牢性の極致" },
          { ep: 15, title: "演算力の再利用：中古ワークステーションという選択肢" },
          { ep: 16, title: "小型PC（NUC/Minisforum）の台頭：空間効率の最適解" },
          { ep: 17, title: "ノートPCのデスクトップ化：Thunderboltドックによる統合" },
          { ep: 18, title: "24時間稼働の科学：省電力自宅サーバーのハード選定" },
          { ep: 19, title: "物理的拡張の限界：eGPUと外付け超高速ストレージ" },
          { ep: 20, title: "【到達】第2章総括：多様な筐体を一つのエコシステムへ" }
        ]
      },
      {
        budget: "¥1,000,000〜",
        label: "第3段階：統合・ホームネットワークと全デバイスの物理統合（上級編）",
        focus: "家中の通信・電力・映像・防犯をIP化し、空間そのものをOSで制御する",
        environment: "10GbEバックボーン・自律型スマートホーム。24時間365日稼働要塞。",
        episodes: [
          { ep: 21, title: "10GbEバックボーン：家庭内通信をボトルネックから解放" },
          { ep: 22, title: "Amazon Ring 4K連携：玄関をデジタルインフラの一部に" },
          { ep: 23, title: "Matter/Thread：メーカーの壁を超える家電統合の規格" },
          { ep: 24, title: "宅内VoIPと固定電話統合：通信インフラのIP化" },
          { ep: 25, title: "サーカディアン照明：PCの演算負荷と連動する光の設計" },
          { ep: 26, title: "EV（車）を電源とみなす：V2H連携と電力の動的制御" },
          { ep: 27, title: "全居室メディアサーバー：遅延ゼロの映像・音響配信" },
          { ep: 28, title: "自律型防犯システム：AIカメラと自宅サーバーの融合" },
          { ep: 29, title: "空間OSのUI設計：スマホ一つで家中を統べるダッシュボード" },
          { ep: 30, title: "【到達】最終統合：44年の知見が到達した『家全体がPC』という境地" }
        ]
      }
    ]
  },

  software: {
    id: "software",
    title: "環境要塞：OSの最適化から、世界へ届ける発信インフラの構築",
    concept: "PCを「脳の延長」に設定し、執筆・デザイン・動画制作を一つのシームレスなワークフローとして統合する。",
    priorityDevice: "Windows 11 Pro・NAS・高速外付けSSD・DaVinci Resolve・OBS Studio",
    phases: [
      {
        budget: "¥0〜¥50,000",
        label: "第1段階：OS・基盤環境の最適化（初級編）",
        focus: "OS의 デトックスと鉄壁のバックアップ。思考を即座に言語化する基盤作り。",
        environment: "クリーンインストール直後のPC。集中作業環境。",
        episodes: [
          { ep: 1, title: "Windows 11 Pro クリーン設定の極意" },
          { ep: 2, title: "集中力を生むデスクトップ・デトックス" },
          { ep: 3, title: "高速ストレージとファイル管理の論理" },
          { ep: 4, title: "鉄壁の自動バックアップ：3-2-1ルールの実装" },
          { ep: 5, title: "IMEとタイピング：思考を即座に言語化する" },
          { ep: 6, title: "疲労を抑える画面設計とフォント選定" },
          { ep: 7, title: "パスワード管理と2要素認証の統合" },
          { ep: 8, title: "ブラウザを強力な調査ツールに変える" },
          { ep: 9, title: "基本ソフトの徹底選定とショートカット化" },
          { ep: 10, title: "【到達】初級編総括：クリエイティブ基地の完成" }
        ]
      },
      {
        budget: "¥50,000〜¥150,000",
        label: "第2段階：効率的な執筆と素材制作（中級編）",
        focus: "NotionやAIを駆使した企画立案。発信を「習慣」から「戦略」へ昇華させる。",
        environment: "ブログ・SNS発信環境。知識管理システム（Obsidian）の構築。",
        episodes: [
          { ep: 11, title: "Notionで作る制作スケジュールと台本管理" },
          { ep: 12, title: "Markdown執筆術：ブログ記事を爆速で書く" },
          { ep: 13, title: "Canvaによるプロ級アイキャッチ制作" },
          { ep: 14, title: "ChatGPTを活用した企画の壁打ちと要約" },
          { ep: 15, title: "スクリーンショットと図解の作成プロトコル" },
          { ep: 16, title: "無料ブログ（note/はてな）での発信戦略" },
          { ep: 17, title: "SNS（X/Instagram）での拡散と連携" },
          { ep: 18, title: "著作権と引用のルール：発信者の守り" },
          { ep: 19, title: "Obsidianによる知識のネットワーク管理" },
          { ep: 20, title: "【到達】中級編総括：『書く力』と『見せる力』の融合" }
        ]
      },
      {
        budget: "¥150,000〜",
        label: "第3段階：動画編集とYouTube発信術（上級編）",
        focus: "4K編集・AI自動化・データ解析。個人の知見を世界の共有資産へ変える。",
        environment: "YouTubeチャンネル運用・動画編集スタジオ。10GbE高速編集環境。",
        episodes: [
          { ep: 21, title: "YouTubeチャンネルの設計とブランディング" },
          { ep: 22, title: "動画編集ソフトの選定：DaVinci vs Premiere" },
          { ep: 23, title: "10GbEとNASを活かした4K編集フロー" },
          { ep: 24, title: "VrewとAIによる『爆速』カット・テロップ入れ" },
          { ep: 25, title: "心に刺さるBGM選定と音響効果の魔術" },
          { ep: 26, title: "OBS Studioによる高品質な画面録画と配信" },
          { ep: 27, title: "サムネイルとタイトルのA/Bテスト理論" },
          { ep: 28, title: "アナリティクス解析：数字から次の企画を作る" },
          { ep: 29, title: "YouTubeと連動した長期的な収益化の設計" },
          { ep: 30, title: "【到達】全編総括：あなたの知見を世界の共有資産へ" }
        ]
      }
    ]
  },

  ai: {
    id: "ai",
    title: "知的要塞：AIを『脳の外部ユニット』として統合し、演算をアウトソースする",
    concept: "AIは検索ツールではない。OSレベルで統合されたCopilotから、GPUパワーを解放するローカルLLMまでを使いこなし、個人の知性を拡張する。",
    priorityDevice: "Microsoft Copilot・NVIDIA RTX GPU (16GB+ VRAM)・LM Studio・Dify",
    phases: [
      {
        budget: "月額 ¥3,000〜",
        label: "第1段階：CopilotとAI対話の基礎（初級編）",
        focus: "AI共生思考の構築と、プロンプトエンジニアリングによる精度向上の習得",
        environment: "全作業工程におけるAIアシスタントの常駐。クラウドAI環境。",
        episodes: [
          { ep: 1, title: "AI時代の『知的加速』：人間は何をすべきか" },
          { ep: 2, title: "Microsoft Copilot完全攻略：OSレベルの革新" },
          { ep: 3, title: "対話の論理：プロンプトエンジニアリング基礎" },
          { ep: 4, title: "クラウドAIの限界と進化：Copilotの役割" },
          { ep: 5, title: "ChatGPT・Claude・Geminiの徹底使い分け術" },
          { ep: 6, title: "AIによる情報の要約とナレッジベース構築" },
          { ep: 7, title: "画像生成AI：プロンプトで視覚情報を支配する" },
          { ep: 8, title: "AIセキュリティ：情報を守りながら恩恵を受ける" },
          { ep: 9, title: "マルチデバイスAI活用：スマホとPCの同期" },
          { ep: 10, title: "【到達】初級編総括：AIが脳の外部ユニットになる日" }
        ]
      },
      {
        budget: "¥300,000〜¥600,000",
        label: "第2段階：GPU活用とローカルLLM（中級編）",
        focus: "クラウド依存からの脱却。自前GPUによるプライバシー重視の知的演算環境の構築",
        environment: "NVIDIA GPU搭載ワークステーション。Python/Anaconda環境。",
        episodes: [
          { ep: 11, title: "ローカルLLMの逆襲：なぜ『自前』が必要か" },
          { ep: 12, title: "NVIDIA GPUとVRAM：AI加速の物理的土台" },
          { ep: 13, title: "GPU vs クラウドAI：現実的なコスト・速度比較" },
          { ep: 14, title: "LM Studio / Ollama：ローカルLLMの簡単導入" },
          { ep: 15, title: "Python超入門：AIを制御するコマンドライン" },
          { ep: 16, title: "データ解析の革命：Pandasによる高速処理" },
          { ep: 17, title: "RAG：自分のPDFやメモをAIに学習させる" },
          { ep: 18, title: "Dify：ノーコードでAIワークフローをデザイン" },
          { ep: 19, title: "ローカル画像生成（Stable Diffusion）の深化" },
          { ep: 20, title: "【到達】中級編総括：ローカル知能による完全な独立" }
        ]
      },
      {
        budget: "¥600,000〜",
        label: "第3段階：Python解析と知的自動化（上級編）",
        focus: "AIエージェントによる業務自動化と、物理空間（スマートホーム）との知能統合",
        environment: "自律型AIエージェント・API連携パイプライン。AGIへの備え。",
        episodes: [
          { ep: 21, title: "AIエージェント：自律的に問題を解決する" },
          { ep: 22, title: "PythonによるWeb自動調査とAIレポーティング" },
          { ep: 23, title: "API連携による知的業務のパイプライン化" },
          { ep: 24, title: "GitHubと連携したAI駆動のツール開発" },
          { ep: 25, title: "動画・音声生成AIの統合ワークフロー" },
          { ep: 26, title: "パーソナルAIの微調整（Fine-Tuning）" },
          { ep: 27, title: "スマートホーム×AI：インフラを統べる知能" },
          { ep: 28, title: "AI時代の防衛論：フェイクを見抜く技術" },
          { ep: 29, title: "汎用人工知能（AGI）への備えと未来予測" },
          { ep: 30, title: "【到達】全章総括：ハード・ソフト・知能の最終統合" }
        ]
      }
    ]
  },

  lifestyle: {
    id: "lifestyle",
    title: "移動要塞：デバイスと住居を身体の一部として統合し、自由を最大化する",
    concept: "スマホを消費の窓から『外部知能』へ、住居を『空間OS』へ、そして車を『移動する蓄電池』へと再定義。物理的な場所の制約をテクノロジーで抹消する。",
    priorityDevice: "iPhone/Android Proモデル・Apple Watch・Matter対応センサー・Home Assistant・EV/V2H",
    phases: [
      {
        budget: "¥150,000〜¥300,000",
        label: "第1段階：スマホ・モバイルの再定義（初級編）",
        focus: "通知の支配による集中力の確保と、PC・クラウドとのシームレスな同期基盤の構築",
        environment: "移動中・外出先。スマホが『思考のコックピット』として機能する環境。",
        episodes: [
          { ep: 1, title: "スマホは『情報の消費機』から『外部知能』へ" },
          { ep: 2, title: "モバイルOSの最適化：通知を支配する" },
          { ep: 3, title: "ウィジェットとショートカットの論理的配置" },
          { ep: 4, title: "クラウド同期の完全自動化：PCとの境界線を消す" },
          { ep: 5, title: "モバイルセキュリティとパスキーの導入" },
          { ep: 6, title: "テザリングとeSIM：どこでも最強の通信環境" },
          { ep: 7, title: "健康管理のデータ化：ウェアラブルの活用" },
          { ep: 8, title: "キャッシュレスと身分証の完全デジタル化" },
          { ep: 9, title: "スマホアクセサリの厳選：MagSafeと電力供給" },
          { ep: 10, title: "【到達】初級編総括：モバイル・ミニマリズムの完成" }
        ]
      },
      {
        budget: "¥200,000〜¥1,000,000",
        label: "第2段階：スマートホームと空間OS（中級編）",
        focus: "Matter規格とHome Assistantによる、ベンダーに依存しない自律型住居の構築",
        environment: "自宅全体。照明・空調・セキュリティが自動連動するインテリジェント空間。",
        episodes: [
          { ep: 11, title: "スマートホームの設計思想：『自動』と『自律』" },
          { ep: 12, title: "Matter/Thread環境の実装：メーカーの垣根を消す" },
          { ep: 13, title: "照明のサーカディアンリズム制御" },
          { ep: 14, title: "空調と空気質のインテリジェント管理" },
          { ep: 15, title: "スマートロックと玄関のデジタル化" },
          { ep: 16, title: "ホームシアターとオーディオのIP統合" },
          { ep: 17, title: "キッチン・水回りのスマート化と節約" },
          { ep: 18, title: "Home Assistantによる全デバイスの司令塔構築" },
          { ep: 19, title: "空間音声とAR：情報の立体配置" },
          { ep: 20, title: "【到達】中級編総括：家という名の巨大なウェアラブル" }
        ]
      },
      {
        budget: "¥5,000,000〜",
        label: "第3段階：EV・V2Hとエネルギーの自給（上級編）",
        focus: "エネルギーの自給自足とBCP（事業継続）。家と車を統合した最強のサバイバルインフラ",
        environment: "オフグリッド対応住宅。移動可能な書斎としてのEV。エネルギー管理システム。",
        episodes: [
          { ep: 21, title: "EV（電気自動車）を『移動する蓄電池』と定義する" },
          { ep: 22, title: "V2H（Vehicle to Home）のソフトウェア制御" },
          { ep: 23, title: "太陽光発電とAI予測の連動" },
          { ep: 24, title: "車のスマート化：リモート操作とAPI連携" },
          { ep: 25, title: "モバイルオフィスとしての車内空間構築" },
          { ep: 26, title: "エネルギーマネジメントダッシュボードの自作" },
          { ep: 27, title: "自律走行時代のライフスタイル予測" },
          { ep: 28, title: "物理インフラのBCP（事業継続計画）" },
          { ep: 29, title: "オフグリッドへの挑戦：システムとしての完全独立" },
          { ep: 30, title: "【到達】全120講・完結：デジタルと物理が溶け合う新世界へ" }
        ]
      }
    ]
  },

  dev: {
    id: "dev",
    title: "開発要塞：Next.jsとPythonを武器に、自ら道具を創造する",
    concept: "コードを書くことは手段であり、目的ではない。AIの力を借りて最短距離でプロダクトをデプロイし、アイデアを現実化する演算力を手に入れる。",
    priorityDevice: "VSCode・Next.js・FastAPI・Vercel・GitHub・Supabase",
    phases: [
      {
        budget: "¥0〜¥400,000",
        label: "第1段階：開発環境とNext.jsの基礎（初級編）",
        focus: "モダンなフロントエンドスタックの習得と、型安全な開発環境の構築",
        environment: "ローカル開発環境。VSCode・Node.js・Git環境。",
        episodes: [
          { ep: 1, title: "モダン開発の全体像：なぜPython+Next.jsか" },
          { ep: 2, title: "VSCodeを最強の武器にするカスタマイズ" },
          { ep: 3, title: "Node.jsとパッケージ管理の基礎知識" },
          { ep: 4, title: "Next.js (App Router) の構造を解剖する" },
          { ep: 5, title: "Tailwind CSS：デザインをロジックで構築する" },
          { ep: 6, title: "TypeScript入門：バグを未然に防ぐ型安全の力" },
          { ep: 7, title: "Git/GitHub：コードのタイムマシンと共有" },
          { ep: 8, title: "Reactコンポーネントの設計思想" },
          { ep: 9, title: "API通信の基本：フロントとバックを繋ぐ" },
          { ep: 10, title: "【到達】初級編総括：Hello Worldを超えた実戦環境" }
        ]
      },
      {
        budget: "¥3,000〜/月",
        label: "第2段階：PythonロジックとAI連携（中級編）",
        focus: "バックエンドとAIの統合。データが循環するフルスタックな仕組みの理解",
        environment: "FastAPIサーバー・OpenAI/Claude API・Supabase DB環境。",
        episodes: [
          { ep: 11, title: "Pythonサーバー（FastAPI）の構築" },
          { ep: 12, title: "AIモデルとのAPI連携（OpenAI/Claude）" },
          { ep: 13, title: "ローカルLLMをプログラムで制御する" },
          { ep: 14, title: "データベース統合：Supabase/PostgreSQL" },
          { ep: 15, title: "Pythonによる自動記事生成パイプライン" },
          { ep: 16, title: "画像処理と最適化：PillowとNext/Image" },
          { ep: 17, title: "Markdown/MDXのパースとレンダリング" },
          { ep: 18, title: "サーバーサイドレンダリング(SSR)の利点" },
          { ep: 19, title: "認証システムの実装：NextAuth.js" },
          { ep: 20, title: "【到達】中級編総括：ロジックとデータが循環する仕組み" }
        ]
      },
      {
        budget: "¥10,000〜/月",
        label: "第3段階：サイトの実装暴露とデプロイ（上級編）",
        focus: "実戦的な運用・監視と、パフォーマンスを極限まで高める最適化技術",
        environment: "Vercel・VPSセルフホスティング。CI/CDパイプライン。",
        episodes: [
          { ep: 21, title: "【暴露】このサイトのディレクトリ構造 全公開" },
          { ep: 22, title: "VercelへのデプロイとCI/CD環境" },
          { ep: 23, title: "VPS（SHIN-VPS）でのセルフホスティング" },
          { ep: 24, title: "パフォーマンス計測とLighthouseの改善" },
          { ep: 25, title: "エラー監視とログ管理の自動化" },
          { ep: 26, title: "AIエージェントによるコード自動レビュー" },
          { ep: 27, title: "SEO戦略の実装：メタデータとサイトマップ" },
          { ep: 28, title: "スケーラビリティと将来の拡張性" },
          { ep: 29, title: "プログラミングが変える『世界の見え方』" },
          { ep: 30, title: "【到達】第5章総括：クリエイターからデベロッパーへ" }
        ]
      }
    ]
  },

  career: {
    id: "career",
    title: "立身要塞：磨き抜いた技術を価値に変え、生涯の自由を確定させる",
    concept: "ハード、ソフト、AI、開発スキル。これら全ての演算能力を「自分という資産」の最大化へ転換し、変化の激しい時代を勝ち抜く戦略を策定する。",
    priorityDevice: "GitHub Portfolio・LinkedIn・自分専用AIエージェント・健康管理ウェアラブル",
    phases: [
      {
        budget: "¥0〜¥100,000",
        label: "第1段階：マインドセットと学習の継続（初級編）",
        focus: "変化を楽しむエンジニア思考の確立と、挫折しないための論理的学習習慣の構築",
        environment: "日々の学習ルーチン。一次ソース（英語）へのアクセス環境。",
        episodes: [
          { ep: 1, title: "エンジニアという『生き方』の再定義" },
          { ep: 2, title: "挫折しないための学習ログ and 習慣化術" },
          { ep: 3, title: "英語ドキュメントへの恐怖心を克服する" },
          { ep: 4, title: "エラー解決の技術：デバッグは推理だ" },
          { ep: 5, title: "コンピュータサイエンスの『地図』を持つ" },
          { ep: 6, title: "情報の取捨選択：何を学び、何を捨てるか" },
          { ep: 7, title: "OSS（オープンソース）への貢献と参加" },
          { ep: 8, title: "コミュニティと勉強会：仲間の見つけ方" },
          { ep: 9, title: "アウトプットは最大のインプットである" },
          { ep: 10, title: "【到達】初級編総括：『初心』という最強の武器" }
        ]
      },
      {
        budget: "¥100,000〜¥300,000",
        label: "第2段階：実戦投入とAIデバッグの技術（中級編）",
        focus: "AIを「部下」として使いこなし、市場から選ばれるプロとしての実績構築",
        environment: "実戦ポートフォリオ。チーム開発・コードレビュー環境。",
        episodes: [
          { ep: 11, title: "選ばれるポートフォリオの作り方（実戦版）" },
          { ep: 12, title: "新職種：AIデバッグエンジニアの台頭" },
          { ep: 13, title: "AIを部下にする：生成コードのディレクション術" },
          { ep: 14, title: "フリーランスかプロ社員か：キャリアの二択" },
          { ep: 15, title: "エンジニアの単価交渉と営業のロジック" },
          { ep: 16, title: "チーム開発の作法：コードレビューの文化" },
          { ep: 17, title: "アジャイル開発とタスク管理のリアリティ" },
          { ep: 18, title: "UI/UXデザインへの越境：使う人を想う" },
          { ep: 19, title: "技術試験（コーディングテスト）対策" },
          { ep: 20, title: "【到達】中級編総括：プロとしての自覚と実力" }
        ]
      },
      {
        budget: "¥500,000〜",
        label: "第3段階：キャリア戦略と未来の展望（上級編）",
        focus: "フルスタック・AI・組織経営を統合し、場所や組織に縛られない「真の自由」の獲得",
        environment: "自社プロダクト・グローバルリモート。次世代への知の継承。",
        episodes: [
          { ep: 21, title: "フルスタック＋AIエンジニアの最強戦略" },
          { ep: 22, title: "CTO / テックリード：技術で組織を率いる" },
          { ep: 23, title: "起業とプロダクト開発：自分のサービスを世へ" },
          { ep: 24, title: "AI時代の生存戦略：『人間による最終承認』の価値" },
          { ep: 25, title: "AIエージェントによる自動開発プロセスの構築" },
          { ep: 26, title: "生涯エンジニア：技術と寄り添う老後と健康" },
          { ep: 27, title: "海外リモートとデジタルノマドの現実" },
          { ep: 28, title: "教育者としての道：次世代に知を繋ぐ" },
          { ep: 29, title: "180講の旅：あなたが手に入れた真の資産" },
          { ep: 30, title: "【到達】グランドフィナーレ：そして伝説へ" }
        ]
      }
    ]
  }
};

// 🔴 重要：ビルドエラーを回避するためのエイリアス・エクスポート群
export const GUIDE_DATA = GUIDE_STRUCTURE; 
export const BTO_FORTRESS_CONFIG = GUIDE_STRUCTURE; 
export const BTO_GUIDE_DATA = GUIDE_STRUCTURE;