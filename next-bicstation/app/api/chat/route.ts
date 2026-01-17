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
            const djangoRes = await fetch(`${DJANGO_URL}/api/pc-products/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                // 💡 警告回避のため cache: 'no-store' のみに統合
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
            // 在庫取得に失敗してもAI回答自体は継続させる
        }

        // 3. Gemini / Gemma の設定と生成（Python版のループ試行ロジックを移植）
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // 💡 試行するモデルの優先順位リスト
        const MODEL_CANDIDATES = [
            "gemma-3-27b-it",   // 本命（ローカルで成功したモデル）
            "gemini-1.5-flash", // 高速フォールバック
            "gemini-1.5-pro"    // 高性能フォールバック
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

        // Pythonスクリプト同様にモデルを順に試す
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
                continue; // 次のモデルへ
            }
        }

        if (!aiText) {
            throw new Error("全てのAIモデルで生成に失敗しました。");
        }

        // 4. AIの回答から「提案された製品名」を抽出して、画像とURLを紐付け
        let productName = null;
        let productUrl = null;
        let productImage = null;

        const match = aiText.match(/RECOMMENDED_PRODUCT:(.*)/);
        if (match && match[1]) {
            const recommendedName = match[1].trim();
            // 在庫データから部分一致で詳細情報を検索
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

        // 余分なタグを消してクリーンなテキストにする
        const cleanText = aiText.replace(/RECOMMENDED_PRODUCT:.*/, '').trim();

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