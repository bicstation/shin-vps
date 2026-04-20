"use client";
import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, doc, serverTimestamp, query } from 'firebase/firestore';
import { 
  Play, Pause, Database, Terminal, Layers, Zap, 
  RefreshCw, CheckCircle, AlertTriangle, BarChart3,
  Cpu, HardDrive, Search, ShieldCheck, Globe, BookOpen
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'next-bicstation';

/**
 * MASTER_GUIDE_DATA
 * 全180講のエピソード構造
 */
const MASTER_GUIDE_DATA = {
  bto: {
    id: "bto",
    name: "物理要塞 (BTO)",
    title: "物理要塞：1円あたりの演算密度を最大化し、家全体をPCにする",
    phases: [
      {
        label: "第1段階：基礎・国内BTOパソコンの最適選定（初級編）",
        episodes: [
          { ep: 1, title: "14歳から見続けたPCの本質：スペック表の『嘘』と『真実』" },
          { ep: 2, title: "演算密度の設計：CPU/GPU選定における論理的最適解" },
          { ep: 3, title: "インフラの品質：マザーボードと電源ユニットの選び方" },
          { ep: 4, title: "BTOカスタマイズの急所：削るべきパーツ、盛るべきパーツ" },
          { ep: 5, title: "静音と冷却の両立：エアフローを支配する物理セットアップ" },
          { ep: 6, title: "マウスコンピューター DAIV/G-Tune攻略：クリエイターの視点" },
          { ep: 7, title: "パソコン工房・ドスパラ徹底比較：コスパ最大化のロジック" },
          { ep: 8, title: "記憶の階層：DDR5 and NVMe Gen5がもたらす体験の変革" },
          { ep: 9, title: "視神経の拡張：モニターとインターフェースの人間工学" },
          { ep: 10, title: "【到達】初期設定と限界負荷試験プロトコル" }
        ]
      },
      {
        label: "第2段階：応用・世界シェアメーカーと小型筐体の攻略（中級編）",
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
        label: "第3段階：統合・ホームネットワークと物理統合（上級編）",
        episodes: [
          { ep: 21, title: "10GbEバックボーン：家庭内通信をボトルネックから解放" },
          { ep: 22, title: "Amazon Ring 4K連携：玄関をデジタルインフラの一部に" },
          { ep: 23, title: "Matter/Thread：メーカーの壁を超える家電統合の規格" },
          { ep: 24, title: "宅内VoIPと固定電話統合：通信インフラのIP化" },
          { ep: 25, title: "サーカディアン照明：PCの演算負荷と連動する光の設計" },
          { ep: 26, title: "EVを電源とみなす：V2H連携と電力の動的制御" },
          { ep: 27, title: "全居室メディアサーバー：遅延ゼロの映像・音響配信" },
          { ep: 28, title: "自律型防犯システム：AIカメラと自宅サーバーの融合" },
          { ep: 29, title: "空間OSのUI設計：スマホ一つで家中を統べるダッシュボード" },
          { ep: 30, title: "【到達】最終統合：家全体がPCという境地" }
        ]
      }
    ]
  },
  software: {
    id: "software",
    name: "環境要塞 (Soft)",
    title: "環境要塞：OSの最適化から、世界へ届ける発信インフラの構築",
    phases: [
      {
        label: "第1段階：OS・基盤環境の最適化（初級編）",
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
        label: "第2段階：効率的な執筆と素材制作（中級編）",
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
        label: "第3段階：動画編集とYouTube発信術（上級編）",
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
          { ep: 30, title: "【到達】全編総括：知見を世界の共有資産へ" }
        ]
      }
    ]
  },
  ai: {
    id: "ai",
    name: "知的要塞 (AI)",
    title: "知的要塞：AIを脳の外部ユニットとして統合する",
    phases: [
      {
        label: "第1段階：CopilotとAI対話の基礎（初級編）",
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
        label: "第2段階：GPU活用とローカルLLM（中級編）",
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
        label: "第3段階：Python解析と知的自動化（上級編）",
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
    name: "移動要塞 (Life)",
    title: "移動要塞：デバイスと住居を身体の一部として統合する",
    phases: [
      {
        label: "第1段階：スマホ・モバイルの再定義（初級編）",
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
        label: "第2段階：スマートホームと空間OS（中級編）",
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
        label: "第3段階：EV・V2Hとエネルギーの自給（上級編）",
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
    name: "開発要塞 (Dev)",
    title: "開発要塞：Next.jsとPythonを武器に、自ら道具を創造する",
    phases: [
      {
        label: "第1段階：開発環境とNext.jsの基礎（初級編）",
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
        label: "第2段階：PythonロジックとAI連携（中級編）",
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
        label: "第3段階：サイトの実装暴露とデプロイ（上級編）",
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
    name: "立身要塞 (Career)",
    title: "立身要塞：磨き抜いた技術を価値に変え、生涯の自由を確定させる",
    phases: [
      {
        label: "第1段階：マインドセットと学習の継続（初級編）",
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
        label: "第2段階：実戦投入とAIデバッグの技術（中級編）",
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
        label: "第3段階：キャリア戦略と未来の展望（上級編）",
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

export default function App() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const isRunningRef = useRef(false);

  // 1. Auth Lifecycle
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token).catch(() => signInAnonymously(auth));
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // 2. Data Synchronization
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
    return onSnapshot(q, (snapshot) => {
      const existing = snapshot.docs.map(d => ({ 
        seriesId: d.data().seriesId, 
        vol: d.data().vol 
      }));
      setArticles(existing);

      let totalCount = 0;
      let doneCount = 0;

      Object.entries(MASTER_GUIDE_DATA).forEach(([sKey, series]) => {
        series.phases.forEach(phase => {
          totalCount += phase.episodes.length;
          phase.episodes.forEach(ep => {
            if (existing.some(a => a.seriesId === sKey && Number(a.vol) === Number(ep.ep))) {
              doneCount++;
            }
          });
        });
      });
      setStats({ total: totalCount, completed: doneCount, pending: totalCount - doneCount });
    }, (err) => addLog(`Firestore Error: ${err.message}`, 'error'));
  }, [user]);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 100));
  };

  // 3. AI Content Generation Engine
  const generateContent = async (job) => {
    const apiKey = "";
    const model = "gemini-2.5-flash-preview-09-2025";
    
    const seriesName = MASTER_GUIDE_DATA[job.seriesId].name;
    const seriesFullTitle = MASTER_GUIDE_DATA[job.seriesId].title;

    const prompt = `
      # Role
      日本最高峰のIT/ハードウェア/ライフスタイル専門家・チーフエディター。
      
      # Target Content
      - 記事タイトル: Vol.${job.ep} ${job.title}
      - シリーズ: ${seriesName} (${seriesFullTitle})
      - フェーズ: ${job.phaseLabel}

      # Instructions
      - この記事は「BicStation 180講」の第${job.ep}話として執筆してください。
      - 2025年の最新トレンド（ハードウェア、ソフトウェア、AI事情）を100%反映。
      - Google検索を活用し、具体的製品名や技術仕様を引用して論理的に解説してください。
      - 読者が明日から実行できる「具体的なアクションプラン」を提示。
      - 言葉遣いは、知的でありながらも熱量の高い、プロフェッショナルな文体。
      - 構成: イントロ -> 論理的解説 -> 最新動向(2025) -> 実践ステップ -> まとめ。
      - Markdown形式で3500文字以上の圧倒的ボリュームを目指してください。
    `;

    const wait = (ms) => new Promise(res => setTimeout(res, ms));
    const delays = [1000, 2000, 4000, 8000, 16000];

    for (let i = 0; i < delays.length; i++) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ "google_search": {} }]
          })
        });
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (e) {
        addLog(`APIリトライ (${i+1}/5): ${e.message}`, 'warning');
        await wait(delays[i]);
      }
    }
    return null;
  };

  // 4. Production Main Loop
  useEffect(() => {
    isRunningRef.current = isRunning;
    if (!isRunning || !user) return;

    const engineLoop = async () => {
      if (!isRunningRef.current) return;

      let target = null;
      // 180講を順番にサーチ
      searchJob: for (const [sKey, series] of Object.entries(MASTER_GUIDE_DATA)) {
        for (const phase of series.phases) {
          for (const ep of phase.episodes) {
            const exists = articles.some(a => a.seriesId === sKey && Number(a.vol) === Number(ep.ep));
            if (!exists) {
              target = { ...ep, seriesId: sKey, phaseLabel: phase.label };
              break searchJob;
            }
          }
        }
      }

      if (!target) {
        addLog(">>> 全180講、すべての記事がアーカイブされました。ミッション完了。");
        setIsRunning(false);
        return;
      }

      setCurrentJob(target);
      addLog(`[生成開始] Vol.${target.ep} | ${target.title}`);

      const result = await generateContent(target);

      if (result && isRunningRef.current) {
        try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), {
            title: target.title,
            content: result,
            seriesId: target.seriesId,
            phaseLabel: target.phaseLabel,
            vol: target.ep,
            userId: user.uid,
            status: 'published',
            author: 'BicStation_AI_Mass_V5',
            createdAt: serverTimestamp()
          });
          addLog(`[保存成功] Vol.${target.ep} のアーカイブ完了。`, 'success');
        } catch (err) {
          addLog(`[保存エラー] Firestoreへの書き込みに失敗: ${err.message}`, 'error');
          setIsRunning(false); // エラー時は安全のため停止
        }
      } else if (!result) {
        addLog(`[停止] APIエラーが解決しないため生産を中断しました。`, 'error');
        setIsRunning(false);
      }

      // 次のループへ (Rate limit考慮のため7秒待機)
      if (isRunningRef.current) {
        setTimeout(engineLoop, 7000);
      }
    };

    engineLoop();
  }, [isRunning, user, articles]);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-400 font-mono p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="bg-slate-900/80 border border-emerald-500/20 p-8 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10" />
          
          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-2xl transition-all duration-500 ${isRunning ? 'bg-emerald-500/20 text-emerald-500 animate-pulse ring-4 ring-emerald-500/10' : 'bg-slate-800 text-slate-500'}`}>
              <Cpu size={36} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-white font-black text-3xl tracking-tighter italic">BICSTATION <span className="text-emerald-500">MASS_V5</span></h1>
                <span className="bg-white/10 text-white text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">Enterprise Edition</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                  <ShieldCheck size={10} /> {isRunning ? 'ENGINE_RUNNING' : 'SYSTEM_IDLE'}
                </span>
                <span className="text-slate-600 text-[10px] flex items-center gap-1"><HardDrive size={10}/> ID: {user?.uid.substring(0, 12)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold tracking-[0.2em] mb-1">AGGREGATED_PROGRESS</div>
              <div className="text-4xl font-black text-white leading-none tabular-nums">
                {Math.round((stats.completed / stats.total) * 100) || 0}<span className="text-sm text-emerald-500 ml-1">%</span>
              </div>
            </div>
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`h-16 px-10 rounded-2xl font-black text-sm flex items-center gap-3 transition-all active:scale-95 ${isRunning ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500 text-black hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.2)]'}`}
            >
              {isRunning ? <><Pause size={20} fill="currentColor" /> TERMINATE</> : <><Play size={20} fill="currentColor" /> INITIATE_LOOP</>}
            </button>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total_Syllabus', val: stats.total, icon: <BookOpen size={16}/>, color: 'text-slate-400', sub: '180 Episodes' },
            { label: 'Archived_Docs', val: stats.completed, icon: <CheckCircle size={16}/>, color: 'text-emerald-500', sub: 'Verified in DB' },
            { label: 'Pending_Queue', val: stats.pending, icon: <Zap size={16}/>, color: 'text-amber-500', sub: 'Next Target' }
          ].map((s, i) => (
            <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl hover:bg-slate-900/60 transition-all group">
              <div className={`flex items-center gap-3 mb-4 ${s.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                <span className="p-2 bg-black/40 rounded-lg">{s.icon}</span> 
                <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-black text-white tabular-nums">{s.val}</div>
                <div className="text-[10px] text-slate-600 font-bold">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN CONSOLE & STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CONSOLE */}
          <div className="lg:col-span-7 bg-black border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-[550px] shadow-2xl">
            <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3 px-2 text-white">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest ml-4">Kernel_Output_Stream</span>
              </div>
              <div className="text-[10px] text-slate-600">RT_LINK_STABLE</div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto font-mono text-[10px] space-y-2 bg-[#020408] scrollbar-hide">
              {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-800 space-y-4">
                  <Terminal size={48} className="opacity-20" />
                  <div className="italic text-center">Standby... <br/> Awaiting system initiation command.</div>
                </div>
              )}
              {logs.map((log, i) => (
                <div key={i} className={`flex gap-4 p-2 rounded-lg border border-transparent transition-all hover:border-white/5 ${
                  log.includes('[保存成功]') ? 'bg-emerald-500/5 text-emerald-400' : 
                  log.includes('エラー') ? 'bg-red-500/5 text-red-400' : 
                  log.includes('リトライ') ? 'text-amber-400' : 'text-slate-500'
                }`}>
                  <span className="opacity-30 shrink-0 font-bold">{log.split('] ')[0]}]</span>
                  <span className="font-medium">{log.split('] ')[1]}</span>
                </div>
              ))}
              <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
            </div>
            
            {isRunning && (
              <div className="p-4 bg-emerald-500/5 border-t border-emerald-500/10 flex items-center gap-3 text-emerald-500/80 font-bold text-[10px]">
                <RefreshCw size={12} className="animate-spin" />
                <span className="animate-pulse">CYBER_CORE_ACTIVE: EXECUTING GENERATION PIPELINE...</span>
              </div>
            )}
          </div>

          {/* STATUS LIST */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 overflow-y-auto h-[550px] shadow-2xl relative">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-blue-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Syllabus_Deployment</h3>
              </div>
              <div className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20 font-bold">180_BLOCKS</div>
            </div>

            <div className="space-y-10">
              {Object.entries(MASTER_GUIDE_DATA).map(([sId, series]) => {
                const sDone = articles.filter(a => a.seriesId === sId).length;
                let sTotal = 0;
                series.phases.forEach(p => sTotal += p.episodes.length);
                const pct = Math.round((sDone / sTotal) * 100) || 0;
                
                return (
                  <div key={sId} className="group">
                    <div className="flex justify-between text-[11px] mb-3 items-end">
                      <div className="space-y-1">
                        <div className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">Series_Identifier: {sId}</div>
                        <div className="text-white font-black group-hover:text-emerald-400 transition-colors">{series.name}</div>
                      </div>
                      <div className={`font-black tabular-nums ${pct === 100 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {sDone} <span className="text-[8px] opacity-40">/ {sTotal}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <div 
                        className={`h-full rounded-full transition-all duration-[2000ms] ease-out ${
                          pct === 100 ? 'bg-emerald-500' : 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5">
              <div className="text-[10px] text-slate-500 font-bold mb-3 uppercase tracking-widest">Quick_Status</div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(MASTER_GUIDE_DATA).map(key => (
                  <div key={key} className={`w-3 h-3 rounded-sm ${articles.filter(a => a.seriesId === key).length === 30 ? 'bg-emerald-500' : 'bg-slate-800 animate-pulse'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* OVERLAY WORKER CARD */}
        {isRunning && currentJob && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-emerald-500 p-6 rounded-[2rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] flex items-center justify-between z-50 transform border-4 border-[#05070a] group">
            <div className="flex items-center gap-6 overflow-hidden">
              <div className="w-16 h-16 bg-[#05070a] rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                <RefreshCw className="animate-spin" size={32} />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black text-black/50 uppercase tracking-[0.2em] px-2 py-0.5 bg-black/5 rounded">Generating_Task</span>
                  <span className="text-[9px] font-black text-black/80">{currentJob.seriesId.toUpperCase()}</span>
                </div>
                <div className="text-xl font-black text-black leading-tight truncate">
                  Vol.{currentJob.ep} <span className="opacity-80 font-bold">{currentJob.title}</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-2 shrink-0">
              <div className="px-4 py-2 bg-black text-emerald-500 rounded-xl font-black text-[10px] border border-black/10 uppercase shadow-lg">
                Phase: {currentJob.phaseLabel.substring(0, 10)}...
              </div>
              <div className="px-4 py-1 bg-black/10 text-black/60 rounded-lg font-bold text-[8px] text-center">
                V5_PROD_READY
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}