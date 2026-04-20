export interface SoftwareGuideItem {
  vol: number;
  title: string;
  description: string;
  category: "初級編" | "中級編" | "上級編";
  tags: string[];
}

export const SOFTWARE_GUIDE_DATA: SoftwareGuideItem[] = [
  // --- 初級編: OS・基盤環境の最適化 ---
  { vol: 1, title: "Windows 11 Pro クリーン設定の極意", description: "余計な機能を削ぎ落とし、クリエイティブ作業に100%の力を向ける初期設定。", category: "初級編", tags: ["Windows", "Setup"] },
  { vol: 2, title: "集中力を生むデスクトップ・デトックス", description: "視覚的ノイズを排除し、起動した瞬間に「やるべきこと」へ向かえるUI環境。", category: "初級編", tags: ["Focus", "UI"] },
  { vol: 3, title: "高速ストレージとファイル管理の論理", description: "SSDとNASをどう使い分けるか。素材を探す時間をゼロにする整理術。", category: "初級編", tags: ["Storage", "Data"] },
  { vol: 4, title: "鉄壁の自動バックアップ：3-2-1ルールの実装", description: "制作中のデータは命。物理故障や誤削除から作品を永久に守るシステム。", category: "初級編", tags: ["Backup", "Security"] },
  { vol: 5, title: "IMEとタイピング：思考を即座に言語化する", description: "辞書登録と入力環境のカスタマイズで、執筆速度のボトルネックを解消する。", category: "初級編", tags: ["Input", "Speed"] },
  { vol: 6, title: "疲労を抑える画面設計とフォント選定", description: "長時間モニタを見続けるクリエイターのための、眼精疲労対策と視認性の向上。", category: "初級編", tags: ["Health", "Font"] },
  { vol: 7, title: "パスワード管理と2要素認証の統合", description: "SNSアカウントの乗っ取りを防ぐ。安全かつ高速な認証環境の構築。", category: "初級編", tags: ["Security", "Auth"] },
  { vol: 8, title: "ブラウザを強力な調査ツールに変える", description: "お気に入り整理から拡張機能まで、情報収集の効率を極限まで高める技。", category: "初級編", tags: ["Browser", "Efficiency"] },
  { vol: 9, title: "基本ソフトの徹底選定とショートカット化", description: "「迷う時間」を削る。厳選されたツールをキーボードだけで操る習熟法。", category: "初級編", tags: ["Apps", "Shortcuts"] },
  { vol: 10, title: "初級編総括：クリエイティブ基地の完成", description: "土台は整った。これから始まるアウトプットのための「最強の標準」を確認。", category: "初級編", tags: ["Summary"] },

  // --- 中級編: 効率的な執筆と素材制作 ---
  { vol: 11, title: "Notionで作る制作スケジュールと台本管理", description: "企画、リサーチ、台本作成。制作の全工程を一つのデータベースで統べる。", category: "中級編", tags: ["Notion", "Planning"] },
  { vol: 12, title: "Markdown執筆術：ブログ記事を爆速で書く", description: "装飾よりも内容に集中する。効率的な執筆と、各プラットフォームへの移行。", category: "中級編", tags: ["Markdown", "Writing"] },
  { vol: 13, title: "Canvaによるプロ級アイキャッチ制作", description: "デザインの法則をツールで補完。クリックされるサムネイルの論理的構成。", category: "中級編", tags: ["Design", "Canva"] },
  { vol: 14, title: "ChatGPTを活用した企画の壁打ちと要約", description: "AIをアシスタントにし、ネタ出しから記事の構成案作成までを高速化する。", category: "中級編", tags: ["AI", "ChatGPT"] },
  { vol: 15, title: "スクリーンショットと図解の作成プロトコル", description: "「伝わる」画像を瞬時に作る。ShareX等を駆使した最短の図解作成術。", category: "中級編", tags: ["Visual", "ShareX"] },
  { vol: 16, title: "無料ブログ（note/はてな）での発信戦略", description: "まずは書く習慣を。プラットフォームの特性を活かしたファン作りの基礎。", category: "中級編", tags: ["Blog", "note"] },
  { vol: 17, title: "SNS（X/Instagram）での拡散と連携", description: "一つのコンテンツを使い倒す。ブログとSNSを繋ぐ「再利用」のロジック。", category: "中級編", tags: ["SNS", "Marketing"] },
  { vol: 18, title: "著作権と引用のルール：発信者の守り", description: "トラブルを未然に防ぐ。画像利用や情報引用における法的・倫理的ガイドライン。", category: "中級編", tags: ["Copyright", "Law"] },
  { vol: 19, title: "Obsidianによる知識のネットワーク管理", description: "過去の自分の知識をリンクさせ、新しい発信のネタを無限に生み出すシステム。", category: "中級編", tags: ["Obsidian", "Knowledge"] },
  { vol: 20, title: "中級編総括：『書く力』と『見せる力』の融合", description: "文字と画像による表現をマスターし、いよいよ動画制作のステージへ。", category: "中級編", tags: ["Summary"] },

  // --- 上級編: 動画編集とYouTube発信術 ---
  { vol: 21, title: "YouTubeチャンネルの設計とブランディング", description: "誰に、何を届けるか。44年の知見を凝縮した「勝てる」チャンネルの土台作り。", category: "上級編", tags: ["YouTube", "Strategy"] },
  { vol: 22, title: "動画編集ソフトの選定：DaVinci vs Premiere", description: "GPUパワーをフルに活かすソフト選びと、基本操作の論理的習得。", category: "上級編", tags: ["Editing", "Video"] },
  { vol: 23, title: "10GbEとNASを活かした4K編集フロー", description: "重い動画素材をネットワーク経由でサクサク扱う、プロ仕様のワークフロー。", category: "上級編", tags: ["4K", "10GbE"] },
  { vol: 24, title: "VrewとAIによる『爆速』カット・テロップ入れ", description: "一番時間がかかる作業をAIで自動化。動画制作のタイパを極限まで上げる。", category: "上級編", tags: ["AI", "Vrew"] },
  { vol: 25, title: "心に刺さるBGM選定と音響効果の魔術", description: "音は映像の半分。視聴維持率を上げるためのオーディオ編集と権利関係。", category: "上級編", tags: ["Audio", "BGM"] },
  { vol: 26, title: "OBS Studioによる高品質な画面録画と配信", description: "解説動画のクオリティはここで決まる。ビットレートと解像度の最適設定。", category: "上級編", tags: ["OBS", "Recording"] },
  { vol: 27, title: "サムネイルとタイトルのA/Bテスト理論", description: "クリック率は科学だ。統計に基づいた「選ばれる」動画のパッケージング。", category: "上級編", tags: ["YouTube", "ClickRate"] },
  { vol: 28, title: "アナリティクス解析：数字から次の企画を作る", description: "視聴維持率グラフの読み解き。データから「視聴者が求めているもの」を特定する。", category: "上級編", tags: ["Analysis", "Data"] },
  { vol: 29, title: "YouTubeと連動した長期的な収益化の設計", description: "広告収入だけじゃない。自分のファンを作り、ビジネスへと繋げるロードマップ。", category: "上級編", tags: ["Business", "Growth"] },
  { vol: 30, title: "全編総括：あなたの知見を世界の共有資産へ", description: "PCという道具を完全に支配し、価値ある情報を発信し続ける旅の始まり。", category: "上級編", tags: ["Final", "Creation"] }
];

export const BTO_GUIDE_DATA = [];