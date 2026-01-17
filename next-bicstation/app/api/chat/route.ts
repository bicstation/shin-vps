import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        // 1. APIキーの確認
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("🚨 GEMINI_API_KEY is missing in env");
            return NextResponse.json({ text: "システム設定エラー（APIキー未設定）です。" }, { status: 500 });
        }

        // 2. Django API から在庫を取得
        const DJANGO_URL = process.env.DJANGO_API_URL || "http://django-v2:8000";
        let productListContext = "現在、最新の在庫リストを取得できませんでした。";
        let allProducts: any[] = [];

        try {
            // 💡 修正ポイント: next: { revalidate: 0 } を削除し cache: 'no-store' に一本化
            const djangoRes = await fetch(`${DJANGO_URL}/api/pc-products/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                cache: 'no-store' 
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

        // 3. AIモデルの設定（最新リストに基づき更新）
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // 💡 試行するモデルの優先順位リスト (2026年最新版)
        const MODEL_CANDIDATES = [
            "gemini-2.5-flash",    // 最優先：高速・高精度
            "gemma-3-27b-it",      // 本命：オープンモデル
            "gemini-2.0-flash",    // 安定版フォールバック
            "gemini-1.5-flash"     // 旧世代フォールバック
        ];

        const prompt = `
あなたはPC専門ポータルサイト「BICSTATION」の公認コンシェルジュです。
【当店の在庫リスト】からユーザーの要望に最適な1台を選んで提案してください。

【当店の在庫リスト】
${productListContext}

【回答ルール】
1. 提案するPCの名前を必ず <b>製品名</b> のように太字で含めてください。
2. その製品が在庫リストにある場合、回答の最後に必ず「RECOMMENDED_PRODUCT:製品名」という形式で1行追加してください。
3. 改行を活用し、読みやすくHTML（<b>等）を使って装飾してください。
4. 在庫リストにぴったりのものがない場合は、リストの中から最も条件に近いものを勧めてください。

質問: ${message}
        `;

        let aiText = "";
        let usedModel = "";

        // モデルを順に試行
        for (const modelId of MODEL_CANDIDATES) {
            try {
                console.log(`🤖 AI試行中: ${modelId}`);
                const model = genAI.getGenerativeModel({ model: modelId });
                const result = await model.generateContent(prompt);
                aiText = result.response.text();
                
                if (aiText) {
                    usedModel = modelId;
                    console.log(`✅ AI生成成功 (${usedModel})`);
                    break; 
                }
            } catch (err: any) {
                console.warn(`❌ モデル ${modelId} でエラー:`, err.message);
                continue; 
            }
        }

        if (!aiText) {
            throw new Error("全てのAIモデルで生成に失敗しました。");
        }

        // 4. AIの回答から製品情報を抽出
        let productName = null;
        let productUrl = null;
        let productImage = null;

        const match = aiText.match(/RECOMMENDED_PRODUCT:(.*)/);
        if (match && match[1]) {
            const recommendedName = match[1].trim();
            const found = allProducts.find(p => 
                recommendedName.toLowerCase().includes(p.name.toLowerCase()) || 
                p.name.toLowerCase().includes(recommendedName.toLowerCase())
            );

            if (found) {
                productName = found.name;
                productUrl = found.url;
                productImage = found.image_url || found.image || null;
            }
        }

        // 余分なタグやAI特有のコードブロック記法を消してクリーンにする
        const cleanText = aiText
            .replace(/RECOMMENDED_PRODUCT:.*/g, '')
            .replace(/```html|```/g, '')
            .trim();

        return NextResponse.json({ 
            text: cleanText,
            productName,
            productUrl,
            productImage
        });

    } catch (error: any) {
        console.error("🚨 Final Chat Error:", error.message);
        return NextResponse.json({ 
            text: "申し訳ありません。コンシェルジュとの通信に失敗しました。時間をおいて再度お試しください。" 
        }, { status: 500 });
    }
}