# -*- coding: utf-8 -*-
import re

class HTMLConverter:
    @staticmethod
    def md_to_html(text):
        """Markdown記法およびシステム独自のタグをブログ用HTMLに変換する"""
        if not text:
            return ""

        # --- 🚀 1. システム独自タグのデザインHTML変換（強化版） ---

        # 不要なメタタグ（内部用タイトルや開始タグ）を完全に除去
        text = re.sub(r'\[/?TITLE_HATENA\]', '', text)
        text = re.sub(r'\[/?CONTENT_GENERAL\]', '', text)

        # [CAT] カテゴリ -> 控えめなグレーのバッジ風デザイン
        text = re.sub(
            r'\[CAT\](.*?)\[/CAT\]', 
            r'<div style="margin-bottom:15px;"><span style="background:#6c757d; color:white; padding:3px 10px; border-radius:15px; font-size:0.85em; font-weight:bold;">カテゴリー: \1</span></div>', 
            text
        )

        # [TAG] タグ -> ハッシュタグ風に並べる
        def format_tags(match):
            tags = match.group(1).split(',')
            tag_html = '<div style="margin:15px 0; border-top:1px solid #eee; padding-top:10px;">'
            for t in tags:
                t_strip = t.strip()
                if t_strip:
                    tag_html += f'<span style="color:#007bff; margin-right:12px; font-size:0.9em; font-weight:500;">#{t_strip}</span>'
            tag_html += '</div>'
            return tag_html
        text = re.sub(r'\[TAG\](.*?)\[/TAG\]', format_tags, text)

        # [TITLE_GENERAL] -> リード文バナー（濃紺背景に白文字）
        text = re.sub(
            r'\[TITLE_GENERAL\]\s*(.*?)\s*\[/TITLE_GENERAL\]', 
            r'<div style="background:#2c3e50; color:white; padding:25px; border-radius:8px; margin:25px 0; font-weight:bold; font-size:1.2em; text-align:center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">\1</div>', 
            text, flags=re.DOTALL
        )
        
        # [SUMMARY_BOX] -> 要約ボックス（青系の枠線付きボックス）
        text = re.sub(
            r'\[SUMMARY_BOX\]\s*(.*?)\s*\[/SUMMARY_BOX\]', 
            r'<div style="background:#f0f7ff; border:2px solid #007bff; padding:20px; border-radius:10px; margin:25px 0; color:#333;"><strong style="color:#007bff; display:block; margin-bottom:8px; font-size:1.1em;">📝 本日のニュース・要約</strong>\1</div>', 
            text, flags=re.DOTALL
        )

        # [FEATURE_LIST] -> オレンジの左線ボックス
        text = re.sub(
            r'\[FEATURE_LIST\]\s*(.*?)\s*\[/FEATURE_LIST\]', 
            r'<div style="margin:20px 0; padding:15px; border-left:5px solid #e67e22; background:#fff9f4;"><strong>💡 注目ポイント</strong>\1</div>', 
            text, flags=re.DOTALL
        )

        # 未定義・あるいは空で残ったシステムタグを一括クリーニング
        text = re.sub(r'\[/?(?:SUMMARY_BOX|FEATURE_LIST|SPEC_TABLE|CONCLUSION|PROS_CONS|CHECK_LIST|TARGET_USER)\]', '', text)
        # ----------------------------------------------

        # 2. テーブルの変換 (Markdown table -> HTML table)
        lines = text.split('\n')
        html_output = []
        in_table = False
        
        for line in lines:
            line_strip = line.strip()
            if '|' in line_strip:
                if re.match(r'^[|\s\-:]+$', line_strip):
                    continue
                cells = [c.strip() for c in line_strip.split('|') if c.strip()]
                if not cells:
                    continue
                
                if not in_table:
                    html_output.append('<table style="width:100%; border-collapse:collapse; margin:20px 0; border:1px solid #ccc; font-size:0.9em;">')
                    in_table = True
                    html_output.append('<tr style="background:#2c3e50; color:white;">')
                    for cell in cells:
                        html_output.append(f'<th style="border:1px solid #ccc; padding:10px;">{cell}</th>')
                    html_output.append('</tr>')
                else:
                    html_output.append('<tr>')
                    for cell in cells:
                        html_output.append(f'<td style="border:1px solid #ccc; padding:10px;">{cell}</td>')
                    html_output.append('</tr>')
            else:
                if in_table:
                    html_output.append('</table>')
                    in_table = False
                html_output.append(line)
        
        if in_table:
            html_output.append('</table>')
            
        text = '\n'.join(html_output)

        # 3. 動的なhタグ変換 (# の数に応じた処理 & 全角＃対応)
        def replace_h_tags(match):
            hashes = match.group(1)
            content = match.group(2).strip()
            level = len(hashes.replace('＃', '#'))
            
            styles = {
                1: 'border-bottom:3px solid #2c3e50; padding-bottom:5px; margin:35px 0 15px; font-size:1.6em; font-weight:bold;',
                2: 'border-left:8px solid #2c3e50; padding:10px; background:#f4f4f4; margin:25px 0 15px; font-size:1.4em; font-weight:bold;',
                3: 'border-bottom:2px solid #2c3e50; padding-bottom:5px; margin:20px 0 10px; color:#2c3e50; font-weight:bold;',
                4: 'border-left:5px solid #bdc3c7; padding-left:10px; margin:15px 0 10px; color:#34495e; font-weight:bold;',
            }
            style = styles.get(level, 'margin:10px 0; color:#7f8c8d; font-weight:bold;')
            return f'<h{level} style="{style}">{content}</h{level}>'

        text = re.sub(r'(?m)^[\s　]*([#＃]{1,6})[\s　]*(.+)$', replace_h_tags, text)

        # 4. 太字 (**) -> 強調（黄色マーカー風）
        text = re.sub(r'\*\*(.*?)\*\*', r'<strong style="color:#e74c3c; background:linear-gradient(transparent 70%, #ffeb3b 70%);">\1</strong>', text)
        
        # 5. 箇条書き (*) -> 独自スタイルのli
        text = re.sub(r'(?m)^\*\s*(.+)$', r'<li style="margin-left:20px; list-style-type:square; margin-bottom:8px;">\1</li>', text)
        
        # 6. 改行処理
        # 見出し、テーブル、divタグを保護
        parts = re.split(r'(<table.*?</table>|<h\d.*?</h\d>|<div.*?</div>)', text, flags=re.DOTALL)
        for i in range(len(parts)):
            if not re.search(r'<(table|h\d|div)', parts[i]):
                parts[i] = parts[i].replace('\n', '<br />')
        
        return "".join(parts).strip()