# /home/maya/shin-vps/django/api/management/commands/analyze_rss.py

import feedparser
import csv
import os
import re
import html
import unicodedata
import urllib.request
from janome.tokenizer import Tokenizer
from collections import Counter
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'RSSから名詞を抽出し、プロジェクトごとのキーワード分析結果を保存します'

    def handle(self, *args, **options):
        # 設定：CSVのパスと出力先ディレクトリ
        CSV_FILE = os.path.join(settings.BASE_DIR, 'api/management/commands/teitoku_settings/master_rss_sources.csv')
        OUTPUT_DIR = os.path.join(settings.BASE_DIR, 'master_data/analysis_results')

        if not os.path.exists(OUTPUT_DIR):
            os.makedirs(OUTPUT_DIR)

        self.stdout.write(self.style.SUCCESS(f"🚀 分析開始: {CSV_FILE}"))
        self.analyze_sources(CSV_FILE, OUTPUT_DIR)

    def clean_text(self, text):
        if not text: return ""
        text = html.unescape(text)
        text = re.sub(r'<[^>]*?>', ' ', text)
        text = unicodedata.normalize('NFKC', text)
        text = re.sub(r'https?://[\w/:%#\$&\?\(\)~\.=\+\-]+', ' ', text)
        text = re.sub(r'[!@#$%%^&*()_+={}\[\]:;"\'<>,.?/~`|[\\-]', ' ', text)
        return text.lower()

    def extract_advanced_keywords(self, text, tokenizer):
        cleaned = self.clean_text(text)
        keywords = []
        current_word = ""
        trash_words = ['br', 'mm', 'こと', 'よう', 'ため', 'これ', 'それ', 'の', 'に']

        for token in tokenizer.tokenize(cleaned):
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

    def fetch_rss_content(self, url):
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

    def analyze_sources(self, csv_path, output_dir):
        word_counts = {}
        tokenizer = Tokenizer()
        
        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f"CSVファイルが見つかりません: {csv_path}"))
            return

        with open(csv_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter='\t')
            for row in reader:
                project = row['project']
                url = row['rss_url'].strip()
                category = row['rss_category']
                source_name = row.get('source_name', '不明')

                self.stdout.write(f"📡 収集中: [{project}] {source_name}...")
                xml_data = self.fetch_rss_content(url)
                if not xml_data: continue
                
                feed = feedparser.parse(xml_data)
                all_text = ""
                for entry in feed.entries:
                    title = entry.get('title', '')
                    desc = entry.get('description', '')
                    all_text += f" { (title + ' ') * 5 } {desc}"
                
                found_keywords = self.extract_advanced_keywords(all_text, tokenizer)
                key = f"{project}_{category}"
                if key not in word_counts:
                    word_counts[key] = Counter()
                word_counts[key].update(found_keywords)

        self.stdout.write("\n" + "="*40)
        self.stdout.write("💾 結果を master_data 内に保存します...")
        
        for key, counts in word_counts.items():
            filename = f"analysis_results_{key}.txt"
            save_path = os.path.join(output_dir, filename)
            sorted_items = sorted(counts.items(), key=lambda x: x[1], reverse=True)
            
            try:
                with open(save_path, "w", encoding="utf-8") as out_f:
                    out_f.write(f"Word\tPoints\n--------------------------\n")
                    for word, freq in sorted_items:
                        out_f.write(f"{word}\t{freq}\n")
                
                self.stdout.write(self.style.SUCCESS(f"✅ 保存完了: {save_path}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ 保存失敗: {filename} - {e}"))