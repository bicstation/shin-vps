import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

/**
 * 💡 BICSTATION 統合コンシェルジュ API
 * Django DBから製品データを取得し、HTMLタグを活用して見やすく回答します。
 */
export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        // 1. APIキーの存在確認
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("🚨 APIキーが設定されていません。docker-composeのenv_fileを確認してください。");
            return NextResponse.json(
                { text: "システム設定エラー（APIキー未設定）です。管理者にお問い合わせください。" },
                { status: 500 }
            );
        }

        // 2. Django APIから最新の製品データを取得 (内部ネットワーク)
        let productListContext = "現在、最新の商品リストを取得できませんでした。一般的な知識で回答してください。";
        try {
            // Dockerネットワーク内のサービス名「django-v2」を指定
            const djangoRes = await fetch("http://django-v2:8000/api/pc-products/", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                next: { revalidate: 300 } // 5分間キャッシュ
            });

            if (djangoRes.ok) {
                const data = await djangoRes.json();
                // 💡 Django REST Frameworkの標準形式 (data.results) に対応
                const products = data.results || [];
                
                if (products.length > 0) {
                    const formattedProducts = products.slice(0, 15).map((p: any) => (
                        `- ${p.name}: 価格¥${p.price?.toLocaleString()} (CPU: ${p.cpu}, メモリ: ${p.memory}, ストレージ: ${p.storage})`
                    )).join("\n");
                    
                    productListContext = `【当店の現在の在庫リスト】\n${formattedProducts}`;
                }
            }
        } catch (fetchError) {
            console.error("⚠️ Django APIへの接続に失敗しました:", fetchError);
        }

        // 3. Gemini SDK / Gemma 3 の初期化
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemma-3-27b-it"
        });

        // 4. 指示、在庫データ、ユーザー質問を統合したプロンプト作成
        // 💡 HTMLタグの使用を具体的に指示に含めています
        const prompt = `
あなたはPC専門ポータルサイト「BICSTATION（ビックステーション）」の公認コンシェルジュです。
以下の【ガイドライン】と【当店の在庫リスト】に基づいて回答してください。

【当店の在庫リスト】
${productListContext}

【ガイドライン・回答形式】
- ユーザーに最適なPCを、在庫リストの中から優先的に提案してください。
- 読みやすさを重視し、適宜 **改行** を入れてください。
- 重要な項目（製品名や価格、スペック）は <b>太字</b> で囲んでください。
- リスト形式で回答する場合は <ul><li> などのHTML形式か、箇条書きを活用してください。
- 専門用語（CPU, GPU等）は初心者にも分かりやすく噛み砕いて説明してください。
- 親切でプロフェッショナルなトーンを維持してください。
- 最後に必ず、ユーザーの背中を押すような一言を添えてください。

ユーザーからの質問: ${message}
        `;

        // 5. 回答の生成
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 6. 正常な回答をJSONで返す
        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("🚨 API Error Details:", error.message || error);
        return NextResponse.json(
            { text: "申し訳ありません。少し通信が混み合っているようです。もう一度話しかけていただけますか？" },
            { status: 500 }
        );
    }
}