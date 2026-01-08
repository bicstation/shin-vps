import requests
import xml.etree.ElementTree as ET
from datetime import datetime
# パスは環境に合わせて調整してください
from api.management.commands.linkshare_bc_client import LinkShareAPIClient

class AffiliateManagerLS:  # 💡 ここが 'AffiliateManagerLS' になっているか確認
    def __init__(self):
        self.client = LinkShareAPIClient()
        self.link_cache = {}

    def _fetch_links_for_mid(self, mid):
        if mid in self.link_cache:
            return self.link_cache[mid]

        self.client.refresh_token_if_expired()
        links = []
        start_date = "01012024"
        end_date = datetime.now().strftime("%m%d%Y")
        
        headers = {
            'Authorization': f'Bearer {self.client.access_token}',
            'Accept': 'application/xml'
        }

        for page in range(1, 11):
            url = f"https://api.linksynergy.com/linklocator/1.0/getTextLinks/{mid}/-1/{start_date}/{end_date}/-1/{page}"
            try:
                res = requests.get(url, headers=headers, timeout=15)
                if res.status_code != 200:
                    break
                
                root = ET.fromstring(res.text)
                ns = {'ns1': 'http://endpoint.linkservice.linkshare.com/'}
                items = root.findall('.//ns1:return', ns)
                
                if not items:
                    break
                
                for item in items:
                    links.append({
                        'name': item.findtext('ns1:linkName', namespaces=ns) or "",
                        'click_url': item.findtext('ns1:clickURL', namespaces=ns) or ""
                    })
                if len(items) < 100:
                    break
            except:
                break

        self.link_cache[mid] = links
        return links

    def get_best_link(self, mid, product_name):
        links = self._fetch_links_for_mid(str(mid))
        if not links:
            return None

        product_name_lower = product_name.lower()
        match = next((l for l in links if product_name_lower in l['name'].lower()), None)
        if match:
            return match['click_url']

        fallback_keywords = ["トップ", "セール", "キャンペーン"]
        for kw in fallback_keywords:
            fb = next((l for l in links if kw in l['name']), None)
            if fb:
                return fb['click_url']

        return links[0]['click_url'] if links else None