maya@Marya:/mnt/e/dev/shin-vps$ vps-import -h

【運用フローのガイド】
1. [分析] 12番で現状の製品データを抽出し、キーワードを検討します。
2. [定義] django/master_data/attributes.tsv にキーワードを記述します。
3. [反映] 13番でマスターを登録し、14番で全製品にタグを自動付与します。
4. [SEO]  15番で最新の状態を Google 用サイトマップに反映します。
5. [維持] 新製品のインポート(3番)後は、必ず14番と15番を実行してください。
---------------------------------------
オプション引数:
  -h, --help    このヘルプメッセージを表示して終了します。
maya@Marya:/mnt/e/dev/shin-vps$ 




maya@Marya:/mnt/e/dev/shin-vps$ vps-rebuild -h
================================================================
🛠  SHIN-VPS REBUILD SCRIPT HELP
================================================================
Usage: ./rebuild.sh [TARGET] [SERVICE_KEYWORD...] [OPTIONS]

TARGET (自動判定されます):
  home           家環境 (Local)
  work           仕事環境 (WSL/mnt/e/)
  prod           本番環境 (VPS)

SERVICE_KEYWORDS (ショートカット対応):
  bicstation   -> next-bicstation-v2
  tiper         -> next-tiper-v2
  saving        -> next-bic-saving-v2
  avflash       -> next-avflash-v2

OPTIONS:
  -w, --watch    🚀 ローカル専用: ファイル変更を監視して自動再構築
  --clean        コンテナとイメージを削除 (ボリュームは保持)
  --clean-all    ボリュームを含む全てを強制削除 (危険)
  --no-cache     キャッシュを使わずにビルド
  -h, --help     このヘルプを表示

EXAMPLES:
  ./rebuild.sh bicstation -w          # bicstationを監視モードで開発
  ./rebuild.sh prod --clean           # 本番環境を掃除して再構築
================================================================
maya@Marya:/mnt/e/dev/shin-vps$ 

maya@Marya:/mnt/e/dev/shin-vps$ save -h

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 SHIN-VPS デプロイ管理ツール (Git Integration)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【🚨 最重要事項】
1. 本番サーバー(VPS)上でのソースコード直接編集は「厳禁」です。
2. 修正は必ずローカルPCで行い、本スクリプトでコミット＆プッシュしてください。
3. タグ(v1.x.x)を打つことで GitHub Actions が起動し、自動的にVPSへ反映されます。

【💡 このスクリプトができること】
・コミットメッセージに自動的に次期バージョン番号を付与
・SSHパスワード入力を1回に集約
・GitHub Actions のデプロイ進捗をローカルからリアルタイム監視

【使用方法】
  ./deploy.sh          : 通常のコミット・デプロイ作業を開始
  ./deploy.sh -h       : このヘルプと注意事項を表示
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
