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


# --- SHIN-VPS v3 Web Services (Next.js) ---
172.30.194.109  tiper-host
172.30.194.109  bicstation-host
172.30.194.109  saving-host
172.30.194.109  avflash-host

# --- Backend & API (Django) ---
172.30.194.109  api-tiper-host

# --- Infrastructure Management ---
172.30.194.109  traefik-host
172.30.194.109  log-host
172.30.194.109  pgadmin-host

# --- Docker System (Default) ---
127.0.0.1       localhost
::1             localhost
192.168.0.106   host.docker.internal
192.168.0.106   gateway.docker.internal


シンサーバーのCPU状況

maya@x162-43-73-204:~/shin-vps$ lscpu
アーキテクチャ:                        x86_64
  CPU 操作モード:                      32-bit, 64-bit
  Address sizes:                       40 bits physical, 48 bits
                                        virtual
  バイト順序:                          Little Endian
CPU:                                   4
  オンラインになっている CPU のリスト: 0-3
ベンダー ID:                           AuthenticAMD
  モデル名:                            AMD EPYC-Milan Processor
    CPU ファミリー:                    25
    モデル:                            1
    コアあたりのスレッド数:            1
    ソケットあたりのコア数:            1
    ソケット数:                        4
    ステッピング:                      1
    BogoMIPS:                          3992.50
    フラグ:                            fpu vme de pse tsc msr pa
                                       e mce cx8 apic sep mtrr p
                                       ge mca cmov pat pse36 clf
                                       lush mmx fxsr sse sse2 sy
                                       scall nx mmxext fxsr_opt 
                                       pdpe1gb rdtscp lm rep_goo
                                       d nopl cpuid extd_apicid 
                                       tsc_known_freq pni pclmul
                                       qdq ssse3 fma cx16 pcid s
                                       se4_1 sse4_2 x2apic movbe
                                        popcnt tsc_deadline_time
                                       r aes xsave avx f16c rdra
                                       nd hypervisor lahf_lm cmp
                                       _legacy svm cr8_legacy ab
                                       m sse4a misalignsse 3dnow
                                       prefetch osvw topoext per
                                       fctr_core ssbd ibrs ibpb 
                                       stibp vmmcall fsgsbase ts
                                       c_adjust bmi1 avx2 smep b
                                       mi2 rdseed adx smap clflu
                                       shopt clwb sha_ni xsaveop
                                       t xsavec xgetbv1 xsaves c
                                       lzero xsaveerptr wbnoinvd
                                        arat npt nrip_save umip 
                                       vaes vpclmulqdq rdpid arc
                                       h_capabilities
Virtualization features:               
  仮想化:                              AMD-V
  ハイパーバイザのベンダー:            KVM
  仮想化タイプ:                        完全仮想化
Caches (sum of all):                   
  L1d:                                 128 KiB (4 instances)
  L1i:                                 128 KiB (4 instances)
  L2:                                  2 MiB (4 instances)
  L3:                                  128 MiB (4 instances)
NUMA:                                  
  NUMA ノード数:                       1
  NUMA ノード 0 CPU:                   0-3
Vulnerabilities:                       
  Gather data sampling:                Not affected
  Itlb multihit:                       Not affected
  L1tf:                                Not affected
  Mds:                                 Not affected
  Meltdown:                            Not affected
  Mmio stale data:                     Not affected
  Reg file data sampling:              Not affected
  Retbleed:                            Not affected
  Spec rstack overflow:                Vulnerable: Safe RET, no 
                                       microcode
  Spec store bypass:                   Mitigation; Speculative S
                                       tore Bypass disabled via 
                                       prctl
  Spectre v1:                          Mitigation; usercopy/swap
                                       gs barriers and __user po
                                       inter sanitization
  Spectre v2:                          Mitigation; Retpolines; I
                                       BPB conditional; IBRS_FW;
                                        STIBP disabled; RSB fill
                                       ing; PBRSB-eIBRS Not affe
                                       cted; BHI Not affected
  Srbds:                               Not affected
  Tsx async abort:                     Not affected
  Vmscape:                             Not affected
maya@x162-43-73-204:~/shin-vps$ 