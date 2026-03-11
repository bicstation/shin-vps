# blog_drivers/base_driver.py
import requests
from xml.sax.saxutils import escape

class BaseBlogDriver:
    def __init__(self, config):
        """
        config: BLOG_CONFIGS[b_type] の内容
        """
        self.config = config

    def post(self, title, body, image_url=None, source_url=None, product_info=None):
        """
        各ドライバーでオーバーライドするメインメソッド
        """
        raise NotImplementedError("Subclasses must implement post()")

    def wrap_content(self, body, image_url, source_url, product_info=None, summary=""):
        """
        共通のHTMLレイアウト整形（画像・サマリー・製品リンク・出典）
        """
        img_html = f'<div style="text-align:center;margin-bottom:20px;"><img src="{image_url}" style="max-width:100%; border-radius:8px;"></div>' if image_url else ""
        
        rel_html = ""
        if product_info:
            rel_html = f'''
            <div style="background:#f0f7ff;padding:20px;border:1px solid #cce4ff;border-radius:10px;margin:30px 0;">
                <h4 style="margin-top:0;">紹介製品: {product_info.get('name', '')}</h4>
                <p style="font-size:15px;">価格: {product_info.get('price', '要確認')}</p>
                <a href="{product_info.get('url', '#')}" style="color:#007bff;font-weight:bold;text-decoration:none;">▶ 製品詳細をチェックする</a>
            </div>
            '''
        
        footer = f'<hr><p style="font-size:12px;color:#666;">出典: <a href="{source_url}">{source_url}</a></p>'
        
        return f"{img_html}{summary}{body}{rel_html}{footer}"