# -*- coding: utf-8 -*-
import json
import os

class FanzaStructAnalyzer:
    def __init__(self):
        """
        環境（Docker内/ホスト）に依存せず、このファイルの置かれた場所を基準にパスを設定する
        """
        # このスクリプトが存在するディレクトリを取得 (api/management/commands/)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 相対パスで api_samples ディレクトリを指す
        # これにより Docker コンテナ内の /app/api/... でも正しく動作する
        self.sample_dir = os.path.join(base_dir, 'api_samples')
        self.json_path = os.path.join(self.sample_dir, 'all_floors_sample.json')
        self.output_report_path = os.path.join(self.sample_dir, 'gemma_prompt_master.txt')

    def load_samples(self):
        """JSONファイルを読み込む"""
        if not os.path.exists(self.json_path):
            # デバッグ用に現在の環境情報を出力
            print(f"❌ ファイルが見つかりません。")
            print(f"   探したパス: {self.json_path}")
            print(f"   カレントディレクトリ: {os.getcwd()}")
            return None
        
        try:
            with open(self.json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ ファイル読み込みエラー: {e}")
            return None

    def analyze_paths_for_gemma(self):
        """
        Gemmaが迷わず『最強の仕訳ロジック』を生成できるように、
        全フロアの構造をプロンプト形式で出力する
        """
        data = self.load_samples()
        if not data:
            return

        # プロンプトの組み立て開始
        lines = []
        lines.append("### SYSTEM INSTRUCTION FOR GEMMA ###")
        lines.append("あなたはDMM/FANZA APIのエキスパートエンジニアです。")
        lines.append("提供する全フロアの構造サマリーを解析し、あらゆるサービスに対応できる『汎用正規化パス・マップ』を作成してください。")
        lines.append("\n【重点解析項目】")
        lines.append("1. 動画URL: どのフロアにどの解像度キーが存在するか。優先順位を決定せよ。")
        lines.append("2. 人物名: actress, author, artist, actor, directorの出現パターンを整理せよ。")
        lines.append("3. ブランド: maker, label, series, publisherのどれを主ブランドとすべきか。")
        lines.append("4. キャンペーン: prices構造内の割引フラグや、genre内のセール文言パスを特定せよ。")
        lines.append("5. サンプル画像: sampleImageURL配下の画像リストへの正確なパスを特定せよ。")
        lines.append("\n--- START OF DATA SUMMARY ---\n")

        floors = data.get('floors', {})
        for f_key, content in floors.items():
            sample = content.get('sample', {})
            info = sample.get('iteminfo', {})
            floor_info = content.get('info', {})
            
            # 各階層の構造を抽出
            report = {
                "floor_id": f_key,
                "display": f"[{floor_info.get('site_name')}] {floor_info.get('service_name')} > {floor_info.get('floor_name')}",
                "structure": {
                    "top_level": list(sample.keys()),
                    "iteminfo": list(info.keys()),
                    "video": list(sample.get("sampleMovieURL", {}).keys()) if sample.get("sampleMovieURL") else "NONE",
                    "prices": list(sample.get("prices", {}).keys()) if sample.get("prices") else "NONE",
                    "sample_images": "EXIST" if "sampleImageURL" in sample else "NONE"
                }
            }
            lines.append(json.dumps(report, indent=2, ensure_ascii=False))
            lines.append("-" * 20)

        lines.append("\n--- END OF DATA SUMMARY ---")
        lines.append("\n上記データを基に、Pythonの辞書形式で最適なマッピングロジックを出力してください。この内容をAIに渡すことで、FANZA・DMMの仕訳パイプライン処理で必要な全てのパスを網羅的にカバーできるようになるはずです。")

        # ファイルに書き出し
        final_prompt = "\n".join(lines)
        
        # ディレクトリがない場合は作成（念のため）
        os.makedirs(self.sample_dir, exist_ok=True)
        
        with open(self.output_report_path, 'w', encoding='utf-8') as f:
            f.write(final_prompt)
        
        # 画面に表示
        print(final_prompt)
        print(f"\n✅ Gemma用のプロンプトを生成しました:")
        print(f"👉 {self.output_report_path}")

    def resolve_path(self, item, target_type):
        """
        Gemmaが特定したパスに基づいて、将来的にデータを抜き出すためのプレースホルダ
        """
        if target_type == "campaign":
            return item.get('prices', {}).get('deliveries', {})
            
        if target_type == "sample_images":
            return item.get('sampleImageURL', {}).get('sample_list', {}).get('image', [])

        return None

if __name__ == "__main__":
    analyzer = FanzaStructAnalyzer()
    analyzer.analyze_paths_for_gemma()