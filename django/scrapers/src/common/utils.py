import os
import subprocess

def run_django_import(csv_filename, django_command):
    # コンテナ名を直接指定（docker composeを介さない）
    container_name = "api_django_v2"
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    local_csv_path = os.path.join(base_dir, csv_filename)

    try:
        # 1. CSV転送
        print(f"🚀 CSV転送中: {csv_filename}")
        subprocess.run(["docker", "cp", local_csv_path, f"{container_name}:/usr/src/app/scrapers/{csv_filename}"], check=True)
        
        # 2. コマンド実行 (docker exec を直接使う)
        # これにより、docker-compose.stg.yml ファイルを探す必要がなくなります。
        cmd = ["docker", "exec", container_name, "python", "manage.py", django_command]
        
        print(f"🚀 コンテナ {container_name} 内でインポートを実行中...")
        subprocess.run(cmd, check=True)
        
        print(f"✅ Djangoインポート完了!")
        return True
    except Exception as e:
        print(f"❌ インポートエラー: {e}")
        return False