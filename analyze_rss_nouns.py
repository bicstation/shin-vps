# /home/maya/shin-vps/analyze_rss_nouns.py

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
    if not text: return ""
    text = html.unescape(text)
    text = re.sub(r'<[^>]*?>', ' ', text) # タグをスペースに置換して癒着防止
    text = unicodedata.normalize('NFKC', text)
    text = re.sub(r'https?://[\w/:%#\$&\?\(\)~\.=\+\-]+', ' ', text)
    text = re.sub(r'[!@#$%%^&*()_+={}\[\]:;"\'<>,.?/~`|[\\-]', ' ', text)
    return text.lower()

def extract_advanced_keywords(text):
    cleaned = clean_text(text)
    keywords = []
    current_word = ""
    
    # 解析の邪魔になる「真のゴミ」だけを除外（低ポイントの宝を消さないため最小限に）
    trash_words = ['br', 'mm', 'こと', 'よう', 'ため', 'これ', 'それ', 'の', 'に']

    for token in t.tokenize(cleaned):
        pos = token.part_of_speech.split(',')
        if pos[0] == '名詞' and pos[1] not in ['代名詞', '非自立', '数', '接尾']:
            current_word += token.surface
        else:
            if current_word:
                if len(current_word) > 1 and current_word not in trash_words:
                    keywords.append(current_word)
                current_word = ""
            if pos[0] == '形容詞' and pos[1] == '自立':
                adj_word = token.surface
                if len(adj_word) > 1 and adj_word not in trash_words:
                    keywords.append(adj_word)
    if current_word:
        if len(current_word) > 1 and current_word not in trash_words:
            keywords.append(current_word)
    return keywords

def fetch_rss_content(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': 'age_check_done=1; over18=1; i3_ab=checked'
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.read()
    except:
        return None

def analyze_sources(csv_path):
    word_counts = {}
    
    # CSV読み込み
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            project = row['project']
            url = row['rss_url'].strip()
            category = row['rss_category']
            source_name = row.get('source_name', '不明')

            print(f"📡 収集中: [{project}] {source_name}...")
            xml_data = fetch_rss_content(url)
            if not xml_data: continue
            
            feed = feedparser.parse(xml_data)
            all_text = ""
            for entry in feed.entries:
                title = entry.get('title', '')
                desc = entry.get('description', '')
                # タイトルの重要度を5倍にして結合
                all_text += f" { (title + ' ') * 5 } {desc}"
            
            found_keywords = extract_advanced_keywords(all_text)
            key = f"{project}_{category}"
            if key not in word_counts:
                word_counts[key] = Counter()
            word_counts[key].update(found_keywords)

    # --- ファイル保存プロセス ---
    print("\n" + "="*60)
    print("💾 解析完了。ファイルを保存します...")
    print("="*60)

    for key, counts in word_counts.items():
        filename = f"analysis_results_{key}.txt"
        
        # ポイントの高い順にソート
        sorted_items = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        
        try:
            with open(filename, "w", encoding="utf-8") as out_f:
                # ヘッダー
                out_f.write(f"Word\tPoints\n")
                out_f.write(f"--------------------------\n")
                
                for word, freq in sorted_items:
                    out_f.write(f"{word}\t{freq}\n")
            
            print(f"✅ 保存成功: {filename} ({len(sorted_items)} 単語)")
            
            # コンソールにはサマリーだけ表示
            print(f"   🔝 トップ: {sorted_items[0][0]} ({sorted_items[0][1]}pts)")
            print(f"   🔚 最小値: {sorted_items[-1][0]} ({sorted_items[-1][1]}pts)")

        except Exception as e:
            print(f"❌ 保存失敗: {filename} - {e}")

if __name__ == "__main__":
    CSV_FILE = '/home/maya/shin-dev/shin-vps/django/api/management/commands/teitoku_settings/master_rss_sources.csv'
    analyze_sources(CSV_FILE)