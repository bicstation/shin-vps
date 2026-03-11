# blog_drivers/seesaa_driver.py
import xmlrpc.client
from .base_driver import BaseBlogDriver

class SeesaaDriver(BaseBlogDriver):
    def post(self, title, body, image_url=None, source_url=None, product_info=None, summary=""):
        full_body = self.wrap_content(body, image_url, source_url, product_info, summary)
        
        try:
            s = xmlrpc.client.ServerProxy(self.config['rpc_url'])
            s.metaWeblog.newPost(
                self.config['blog_id'], 
                self.config['user'], 
                self.config['pw'], 
                {'title': title, 'description': full_body}, 
                True
            )
            return True
        except:
            return False