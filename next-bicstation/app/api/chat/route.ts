import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        // 1. APIキーの確認
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("🚨 GEMINI_API_KEY is missing");
            return NextResponse.json({ text: "システム設定エラーです。" }, { status: 500 });
        }

        // 2. Django API 接続先の設定 (環境変数から取得、なければデフォルト)
        // ローカルなら http://localhost:8000, Dockerなら http://django-v2:8000 など
        const DJANGO_URL = process.env.DJANGO_API_URL || "http://django-v2:8000";
        
        let productListContext = "在庫リスト取得不可";
        let allProducts: any[] = [];

        try {
            const djangoRes = await fetch(`${DJANGO_URL}/api/pc-products/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                next: { revalidate: 300 }
            });

            if (djangoRes.ok) {
                const data = await djangoRes.json();
                allProducts = data.results || [];
                
                if (allProducts.length > 0) {
                    const formatted = allProducts.slice(0, 15).map((p: any) => (
                        `- ${p.name}: 価格¥${p.price?.toLocaleString()} (CPU: ${p.cpu}, メモリ: ${p.memory}, URL: ${p.url})`
                    )).join("\n");
                    productListContext = `【当店の現在の在庫リスト】\n${formatted}`;
                }
            }
        } catch (error) {
            console.error("⚠️ Django接続失敗:", error);
        }

        // 3. Geminiの設定
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

        const prompt = `
あなたはPC専門ポータルサイト「BICSTATION」の公認コンシェルジュです。
【当店の在庫リスト】から最適な1台を選んで提案してください。

【当店の在庫リスト】
${productListContext}

【回答ルール】
1. 提案するPCの名前を必ず <b>製品名</b> のように太字で含めてください。
2. その製品が在庫リストにある場合、回答の最後に必ず「RECOMMENDED_PRODUCT:製品名」という形式で1行追加してください。
3. 改行を活用し、読みやすくHTML（<b>等）を使って装飾してください。

質問: ${message}
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // 4. AIの回答から「提案された製品名」を抽出して、画像とURLを紐付け
        let productName = null;
        let productUrl = null;
        let productImage = null;

        // AIが末尾に出力したタグを検索
        const match = text.match(/RECOMMENDED_PRODUCT:(.*)/);
        if (match && match[1]) {
            const recommendedName = match[1].trim();
            // 在庫データから詳細情報を検索
            const found = allProducts.find(p => recommendedName.includes(p.name) || p.name.includes(recommendedName));
            if (found) {
                productName = found.name;
                productUrl = found.url;
                // DjangoのAPIがimage_urlを返している場合はそれを、なければnull
                productImage = found.image_url || found.image || null;
            }
        }

        // 余分なタグを消してクリーンなテキストにする
        const cleanText = text.replace(/RECOMMENDED_PRODUCT:.*/, '').trim();

        return NextResponse.json({ 
            text: cleanText,
            productName,
            productUrl,
            productImage
        });

    } catch (error: any) {
        return NextResponse.json({ text: "通信エラーが発生しました。" }, { status: 500 });
    }
}