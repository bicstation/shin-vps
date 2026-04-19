// /home/maya/shin-vps/next-bicstation/app/series/10-bto-masters/trading/data.ts
import { Episode, BTO_SERIES_CONFIG } from '../data';

const TRADING_TITLES = {
  phase1: [
    "確定損失としてのフリーズ：安定性こそが利益",
    "電源ユニットの格付け：80PLUS Platinumが必須な理由",
    "UPS（無停電電源装置）先行導入：停電を『ただのイベント』に変える",
    "シングルコアクロックの重要性：板情報の更新速度を追う",
    "OSの徹底軽量化：バックグラウンド通知はすべて敵だ",
    "ブラウザのメモリ管理：タブ100個でも落ちない設定",
    "Intel I225-Vの選択：パケットロスを物理的に防ぐ",
    "デュアルモニターの同期：ズレない視線移動の構築",
    "キーボードの静音化：打鍵音はノイズ、思考の邪魔",
    "監視者の誕生：15万円で掴む安定の第一歩"
  ],
  phase2: [
    "4画面出力の壁：ビデオカードの出力ポート数と帯域",
    "メモリ64GBの衝撃：巨大なExcelとチャートの同時展開",
    "モニターアームの幾何学：首の疲労を計算した配置",
    "RAID 1（ミラーリング）の構築：ドライブ故障を無効化する",
    "高リフレッシュレートの意外な効能：目の疲れを最小限に",
    "ショートカットキーの物理化：注文ボタンを左手に置く",
    "ブルーライトカットの真実：長時間監視を支える保護",
    "PCケースの防塵対策：365日稼働を支えるエアフロー",
    "ファンレスGPUの検討：無音こそが集中力の源泉",
    "約定者の進撃：35万円の多画面情報要塞"
  ],
  phase3: [
    "完全静音・水冷化：ファンの回転音すら意識から消す",
    "ECCメモリの導入：ビット反転エラーによる暴走を防ぐ",
    "バックアップ回線の自動切替：Starlinkと有線の冗長化",
    "10GbEによるNAS連携：全取引履歴の即時アーカイブ",
    "フットレストと姿勢制御：血流が判断速度を決定する",
    "物理セキュリティ：取引環境への物理的アクセス制限",
    "マザーボードのVRM冷却：夏場の24時間稼働を耐え抜く",
    "モニタリング用サブマシンの構築：負荷を分散せよ",
    "注文専用マシンの分離：ブラウジングと注文を分ける贅沢",
    "裁定者の境地：60万円の鉄壁・静寂環境"
  ],
  phase4: [
    "覇者の椅子：アーロンチェアがもたらす『座る』の完成",
    "200V電源の引き込み：電圧の揺らぎを根源から断つ",
    "サーバーラック導入：PCを居住空間から物理的に隔離する",
    "ルーム温度管理システム：室温を1度単位で固定せよ",
    "専用光回線の直接引き込み：共有回線のノイズを排除",
    "生体認証による起動管理：情報の完全防壁",
    "究極の8画面出力：全市場を一度に俯瞰する視覚",
    "自動売買サーバーの冗長構成：24時間の自動演算",
    "環境の完成：不確実性を演算で支配した領域",
    "支配者の称号：120万円のトレーディング・サンクタム"
  ]
};

const TRADING_HINTS = {
  phase1: "1円を惜しんで電源ランクを下げるな。それは爆弾を抱えて取引するに等しい。",
  phase2: "画面数が増えるほど、視線移動の『ミリ秒』が累積する。アームで距離を詰めろ。",
  phase3: "エラー1回で数日分の利益が飛ぶ。ECCメモリとUPSは保険ではなく投資だ。",
  phase4: "最終的な勝敗は、演算機と『それを操作する人間』のコンディションで決まる。"
};

export const getTradingEpisodes = (): Episode[] => {
  return Array.from({ length: 40 }, (_, i) => {
    const vol = i + 1;
    let phaseKey: keyof typeof TRADING_TITLES = 'phase1';
    let titleIdx = i;

    if (vol <= 10) { phaseKey = 'phase1'; titleIdx = i; }
    else if (vol <= 20) { phaseKey = 'phase2'; titleIdx = i - 10; }
    else if (vol <= 30) { phaseKey = 'phase3'; titleIdx = i - 20; }
    else { phaseKey = 'phase4'; titleIdx = i - 30; }

    return {
      volume: vol,
      title: `Vol.${vol}: ${TRADING_TITLES[phaseKey][titleIdx]}`,
      slug: `vol${vol}`,
      technicalHint: TRADING_HINTS[phaseKey],
      isFurnitureUnlocked: vol >= 31
    };
  });
};

export const TRADING_SERIES_DETAIL = {
  ...BTO_SERIES_CONFIG.trading,
  episodes: getTradingEpisodes()
};