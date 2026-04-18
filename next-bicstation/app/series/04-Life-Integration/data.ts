export interface LifestyleGuideItem {
  vol: number;
  title: string;
  description: string;
  category: "初級編" | "中級編" | "上級編";
  tags: string[];
}

export const LIFESTYLE_GUIDE_DATA: LifestyleGuideItem[] = [
  // --- 初級編: スマホ・モバイルの再定義 ---
  { vol: 1, title: "スマホは『情報の消費機』から『外部知能』へ", description: "ダラダラ見るスマホを卒業。AI、メモ、自動化を軸にした最強のモバイル環境設定。", category: "初級編", tags: ["iPhone/Android", "Mindset"] },
  { vol: 2, title: "モバイルOSの最適化：通知を支配する", description: "あなたの時間を奪う通知を全廃。本当に必要な情報だけが届く『全集中モード』の設計。", category: "初級編", tags: ["Settings", "Focus"] },
  { vol: 3, title: "ウィジェットとショートカットの論理的配置", description: "1タップで録音、1タップでAI起動。ホーム画面を『思考のコックピット』に変える。", category: "初級編", tags: ["UI", "Shortcuts"] },
  { vol: 4, title: "クラウド同期の完全自動化：PCとの境界線を消す", description: "スマホで撮った写真、書いたメモが瞬時に自宅PCとNASに現れるシームレスな体験。", category: "初級編", tags: ["Sync", "Cloud"] },
  { vol: 5, title: "モバイルセキュリティとパスキーの導入", description: "物理的な紛失に備える。パスワードを使わない次世代認証で安全と速度を両立する。", category: "初級編", tags: ["Security", "Passkey"] },
  { vol: 6, title: "テザリングとeSIM：どこでも最強の通信環境", description: "公共Wi-Fiは使わない。サブ回線の活用と、外出先での演算環境を確保する通信戦略。", category: "初級編", tags: ["Network", "eSIM"] },
  { vol: 7, title: "健康管理のデータ化：ウェアラブルの活用", description: "睡眠、歩数、心拍。スマホを健康の管制塔にし、パフォーマンスを可視化する。", category: "初級編", tags: ["Health", "AppleWatch"] },
  { vol: 8, title: "キャッシュレスと身分証の完全デジタル化", description: "財布を持ち歩かない自由。スマホ一つで全ての経済活動を完結させる設定。", category: "初級編", tags: ["Wallet", "DigitalID"] },
  { vol: 9, title: "スマホアクセサリの厳選：MagSafeと電力供給", description: "充電のストレスをゼロに。効率を最大化するケーブル、バッテリー、スタンドの選定。", category: "初級編", tags: ["Accessories", "Power"] },
  { vol: 10, title: "初級編総括：モバイル・ミニマリズムの完成", description: "デバイスに操られるのではなく、デバイスを完全に手懐けた状態の確認。", category: "初級編", tags: ["Summary"] },

  // --- 中級編: スマートホームと空間OS ---
  { vol: 11, title: "スマートホームの設計思想：『自動』と『自律』", description: "ボタンを押すのはスマートじゃない。センサーが人を察知し、先回りする家の定義。", category: "中級編", tags: ["SmartHome", "Logic"] },
  { vol: 12, title: "Matter/Thread環境の実装：メーカーの垣根を消す", description: "ハード編で準備した規格をソフトウェアで統合。Apple、Google、Amazonの共存。", category: "中級編", tags: ["Matter", "IoT"] },
  { vol: 13, title: "照明のサーカディアンリズム制御", description: "朝は覚醒、夜は休息。時間帯に合わせて色温度と輝度を自動調整するバイオリズム設計。", category: "中級編", tags: ["Lighting", "Hue"] },
  { vol: 14, title: "空調と空気質のインテリジェント管理", description: "CO2濃度で換気を促し、湿度と温度を24時間一定に保つ。演算能力を環境維持に使う。", category: "中級編", tags: ["Climate", "Sensor"] },
  { vol: 15, title: "スマートロックと玄関のデジタル化", description: "鍵という概念を消す。家族の帰宅通知、荷物の置き配、遠隔解錠のワークフロー。", category: "中級編", tags: ["Security", "SmartLock"] },
  { vol: 16, title: "ホームシアターとオーディオのIP統合", description: "家中どこでも同じ音楽が流れ、スマホから全てのAV機器をコントロールする環境。", category: "中級編", tags: ["Audio", "Cinema"] },
  { vol: 17, title: "キッチン・水回りのスマート化と節約", description: "水漏れ検知から、家電の電気代モニタリング。家全体の消費リソースを可視化する。", category: "中級編", tags: ["Eco", "Monitor"] },
  { vol: 18, title: "Home Assistantによる全デバイスの司令塔構築", description: "クラウドを介さず、自宅内のサーバーで全ての家電を統括する究極の管理手法。", category: "中級編", tags: ["HomeAssistant", "Server"] },
  { vol: 19, title: "空間音声とAR：情報の立体配置", description: "スマホやARグラスを使い、現実空間に情報を重ねる『空間OS』の第一歩。", category: "中級編", tags: ["AR", "Spatial"] },
  { vol: 20, title: "中級編総括：家という名の巨大なウェアラブル", description: "住居があなたの意図を理解し、呼応し始めた状態を評価する。", category: "中級編", tags: ["Summary"] },

  // --- 上級編: EV・V2Hとエネルギーの自給 ---
  { vol: 21, title: "EV（電気自動車）を『移動する蓄電池』と定義する", description: "車を単なる移動手段にしない。自宅のシステムの一部として車を統合する概念。", category: "上級編", tags: ["EV", "Battery"] },
  { vol: 22, title: "V2H（Vehicle to Home）のソフトウェア制御", description: "停電時は車から給電、深夜電力は車に蓄電。電力を『データ』のように管理する。", category: "上級編", tags: ["V2H", "Energy"] },
  { vol: 23, title: "太陽光発電とAI予測の連動", description: "明日の天気をAIが予測し、今夜どれだけ蓄電すべきかを自動判断する自給自足システム。", category: "上級編", tags: ["Solar", "AI"] },
  { vol: 24, title: "車のスマート化：リモート操作とAPI連携", description: "出発前に車内温度を整え、スマホから駐車状況を確認。車をネットの一部にする。", category: "上級編", tags: ["Tesla", "API"] },
  { vol: 25, title: "モバイルオフィスとしての車内空間構築", description: "最強の通信と電源を備えた移動書斎。どこにいても『いつものPC環境』を再現する。", category: "上級編", tags: ["MobileWork", "VanLife"] },
  { vol: 26, title: "エネルギーマネジメントダッシュボードの自作", description: "発電、蓄電、消費。家と車のエネルギーフローをNext.js等で可視化・管理する。", category: "上級編", tags: ["Dashboard", "Dev"] },
  { vol: 27, title: "自律走行時代のライフスタイル予測", description: "運転から解放された時、車内での時間はどう変わるのか。未来の移動UXの考察。", category: "上級編", tags: ["Autonomous", "Future"] },
  { vol: 28, title: "物理インフラのBCP（事業継続計画）", description: "災害時でも、ネット、電力、移動手段を維持し、発信を止めないためのサバイバル術。", category: "上級編", tags: ["BCP", "Survival"] },
  { vol: 29, title: "オフグリッドへの挑戦：システムとしての完全独立", description: "既存の網から切り離されても、テクノロジーを維持して生きていくための究極解。", category: "上級編", tags: ["OffGrid", "Life"] },
  { vol: 30, title: "全90講・完結：デジタルと物理が溶け合う新世界へ", description: "第1〜4章の全知識を統合。最強の環境と知能、そして自由な移動を手に入れたあなたの、新しい人生の始まり。", category: "上級編", tags: ["Final", "Integration"] }
];