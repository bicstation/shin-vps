#!/bin/bash
# scripts/content_station.sh
source "$(dirname "$0")/env.sh"

# データ定義 (旧スクリプトから継承)
MAKERS=("DUMMY" "nec" "sony" "fmv" "dynabook" "hp" "dell" "lenovo" "asus" "msi" "mouse" "acer" "minisforum" "geekom" "vspec" "storm" "frontier" "sycom" "norton" "mcafee" "kingsoft" "cyberlink" "trendmicro" "sourcenext" "edion" "kojima" "sofmap" "bic_sofmap" "recollect" "ioplazy" "eizo" "ark")
MAKER_NAMES=("DUMMY" "NEC" "Sony" "富士通" "Dynabook" "HP" "Dell" "Lenovo" "ASUS" "MSI" "Mouse" "Acer" "Minisforum" "GEEKOM" "VSPEC" "STORM" "FRONTIER" "Sycom" "ノートン" "マカフィー" "キングソフト" "サイバーリンク" "トレンドマイクロ" "ソースネクスト" "エディオン" "コジマ" "ソフマップ" "アキバソフ" "リコレ" "ioPLAZA" "EIZO" "ark")

echo -e "\n${BLUE}--- 💻 CONTENT STATION (PC/GADGET) ---${RESET}"
echo "1) メーカー別同期 (API/FTP/Scrape)"
echo "2) PCパーツ最新ニュース投稿 (RSS)"
echo "3) AI詳細スペック解析 (PC解析)"
echo "4) 既存SEOタイトル一括更新"
echo "b) 戻る"
read -p ">> " OPT
case $OPT in
    1) 
        for ((i=1; i<=31; i+=3)); do
            for ((j=i; j<i+3 && j<=31; j++)); do printf "%-2d) %-20s " "$j" "${MAKER_NAMES[$j]}"; done; echo ""; done
        read -p "メーカー番号: " SUB
        SLUG=${MAKERS[$SUB]}
        # 各メーカーの同期ロジック (旧20番のcaseをここに凝縮)
        run_django python manage.py record_price_history --maker "$SLUG" ;;
    2) run_django python manage.py ai_post_pc_news ;;
    3) read -p "件数: " L; run_django python manage.py analyze_pc_spec --limit ${L:-100} ;;
    4) read -p "件数: " L; run_django python manage.py analyze_pc_spec --limit ${L:-10} --update-all ;;
esac
pause