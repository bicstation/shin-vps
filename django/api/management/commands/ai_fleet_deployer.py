import feedparser
import csv
import os
import re
import html
import unicodedata
import urllib.request
from janome.tokenizer import Tokenizer
from collections import Counter

# 1. 形態素解析器
t = Tokenizer()

def clean_text(text):
    """テキストの徹底クリーニング"""
    if not text: return ""
    text = html.unescape(text)
    text = re.sub(r'<[^>]*?>', '', text)
    text = unicodedata.normalize('NFKC', text)
    # URL排除
    text = re.sub(r'https?://[\w/:%#\$&\?\(\)~\.=\+\-]+', '', text)
    # 記号の排除（解析精度向上のためスペースに置換）
    text = re.sub(r'[!@#$%%^&*()_+={}\[\]:;"\'<>,.?/~`|[\\-]', ' ', text)
    return text.lower()

def extract_extended_keywords(text):
    """
    連続する名詞を結合し、形容詞も拾う強化版抽出ロジック
    """
    cleaned = clean_text(text)
    keywords = []
    current_word = ""
    
    # ストップワード（ノイズを排除）
    stop_words = [
        'こと', 'よう', 'ため', 'これ', 'それ', 'あなた', 'たち', 'こちら', 
        '内容', '紹介', '作品', '無料', '配信', '税込', '以上', '対応', '限定',
        '予約', '新着', 'おすすめ', 'ポイント', '還元', '最大', '販売', '開始',
        '決定', '開催', '詳細', 'チェック', 'ページ', 'クリック', '情報'
    ]

    for token in t.tokenize(cleaned):
        pos = token.part_of_speech.split(',') # ['名詞', '一般', '*', '*']
        
        # 名詞の連続を結合する（例：「美少女」「新人」→「美少女新人」）
        if pos[0] == '名詞' and pos[1] not in ['代名詞', '非自立', '数', '接尾']:
            current_word += token.surface
        else:
            if current_word:
                if len(current_word) > 1 and current_word not in stop_words:
                    keywords.append(current_word)
                current_word = ""
            
            # 形容詞の自立語も拾う（例：「エロい」「凄まじい」など）
            if pos[0] == '形容詞' and pos[1] == '自立':
                adj_word = token.surface
                if len(adj_word) > 1 and adj_word not in stop_words:
                    keywords.append(adj_word)
                    
    if current_word:
        if len(current_word) > 1 and current_word not in stop_words:
            keywords.append(current_word)
            
    return keywords

def fetch_rss_content(url):
    """年齢認証とUAを設定して取得"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': 'age_check_done=1; over18=1; i3_ab=checked'
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.read()
    except Exception as e:
        print(f"   ⚠️ 通信エラー: {url} -> {e}")
        return None

def analyze_sources(csv_path):
    word_counts = {}
    
    if not os.path.exists(csv_path):
        print(f"❌ ファイルが見つかりません: {csv_path}")
        return

    try:
        with open(csv_path, "r", encoding="utf-8-sig") as f:
            # タブ区切りで読み込み
            reader = csv.DictReader(f, delimiter='\t')
            for row in reader:
                project = row.get('project', '').strip()
                url = row.get('rss_url', '').strip()
                category = row.get('rss_category', '').strip()
                source_name = row.get('source_name', 'UNKNOWN')

                if not url or not project: continue
                
                print(f"📡 収集中: [{project}] {source_name}...")
                
                xml_data = fetch_rss_content(url)
                if not xml_data: continue
                
                feed = feedparser.parse(xml_data)
                if not feed.entries:
                    print(f"   ⚠️ データなし: {source_name}")
                    continue

                all_text = ""
                for entry in feed.entries:
                    title = entry.get('title', '')
                    desc = entry.get('description', entry.get('summary', ''))
                    # 【ポイント】タイトルの重要性を高めるため、タイトルを5回繰り返して強調
                    # これにより重要なキーワードのポイントが跳ね上がります
                    all_text += f" { (title + ' ') * 5 } {desc}"
                
                # 強化版抽出ロジックを実行
                found_keywords = extract_extended_keywords(all_text)
                
                key = f"{project}_{category}"
                if key not in word_counts:
                    word_counts[key] = Counter()
                word_counts[key].update(found_keywords)

    except Exception as e:
        print(f"❌ CSV解析エラー: {e}")

    # --- 結果表示 ---
    print("\n" + "="*60)
    print("📊 最終解析結果：RSS出現頻度 TOP 30 (強化版)")
    print("="*60)
    for key, counts in word_counts.items():
        print(f"\n📂 カテゴリ: {key}")
        top_words = counts.most_common(30)
        
        # 1. 詳細表示
        for i, (word, freq) in enumerate(top_words, 1):
            print(f"  {i:2}. {word.ljust(15)} : {freq} pts")
        
        # 2. コピペ用文字列の生成
        csv_keywords = ",".join([w for w, f in top_words])
        print(f"\n📋 【コピペ用キーワード設定（{key}）】")
        print(f"------------------------------------------------------------")
        print(csv_keywords)
        print(f"------------------------------------------------------------")

if __name__ == "__main__":
    CSV_FILE = '/home/maya/shin-dev/shin-vps/django/api/management/commands/teitoku_settings/master_rss_sources.csv'
    analyze_sources(CSV_FILE)