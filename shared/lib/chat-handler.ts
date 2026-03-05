import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

/**
 * サイトごとの設定定義
 */
const SITE_SETTINGS: Record<string, {
    name: string;
    description: string;
    endpoint: string;
}> = {
    'bicstation': {
        name: 'BICSTATION',
        description: 'PC専門ポータルサイトの公認コンシェルジュ',
        endpoint: '/api/pc-products/',
    },
    'avflash': {
        name: 'AVFLASH',
        description: 'アダルトコンテンツの専門コンシェルジュ',
        endpoint: '/api/adult-products/',
    },
    'tiper': {
        name: 'TIPER',
        description: '総合エンタメガイドのコンシェルジュ',
        endpoint: '/api/products/',
    }
};

/**
 * 利用可能なAPIキーを配列として取得
 */
const getApiKeys = () => {
    return [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5,
    ].filter(key => !!key) as string[]; // 設定されていないキーを除外
};

export async function handleChatRequest(req: Request) {
    try {
        const { message } = await req.json();
        const url = new URL(req.url);
        
        // 1. サイト判定
        const host = req.headers.get('host') || '';
        let siteKey = 'bicstation';
        if (host.includes('avflash') || url.pathname.includes('avflash')) siteKey = 'avflash';
        else if (host.includes('tiper') || url.pathname.includes('tiper')) siteKey = 'tiper';

        const config = SITE_SETTINGS[siteKey];

        // 2. Django から在庫を取得
        const DJANGO_URL = process.env.DJANGO_API_URL || "http://django-v3:8000";
        let productListContext = "現在、最新の在庫リストを取得できませんでした。";
        let allProducts: any[] = [];

        try {
            const djangoRes = await fetch(`${DJANGO_URL}${config.endpoint}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                cache: 'no-store' 
            });

            if (djangoRes.ok) {
                const data = await djangoRes.json();
                allProducts = data.results || [];
                
                if (allProducts.length > 0) {
                    const formatted = allProducts.slice(0, 15).map((p: any) => (
                        `- ${p.name || p.title}: 価格¥${p.price?.toLocaleString()} (詳細: ${p.cpu || p.genre || ''}, URL: ${p.url || p.affiliate_url})`
                    )).join("\n");
                    productListContext = `【当店の現在の在庫リスト】\n${formatted}`;
                }
            }
        } catch (error) {
            console.error(`⚠️ Django接続失敗 (${siteKey}):`, error);
        }

        // 3. AIモデル試行 (APIキーのローテーション)
        const apiKeys = getApiKeys();
        const MODEL_CANDIDATES = ["gemini-2.0-flash", "gemini-1.5-flash"];
        
        const prompt = `
あなたは${config.description}「${config.name}」です。
【当店の在庫リスト】からユーザーの要望に最適なアイテムを選んで提案してください。

【当店の在庫リスト】
${productListContext}

【回答ルール】
1. 提案するアイテム名を必ず <b>名称</b> のように太字で含めてください。
2. そのアイテムが在庫リストにある場合、回答の最後に必ず「RECOMMENDED_PRODUCT:名称」という形式で1行追加してください。
3. 改行を活用し、読みやすくHTML（<b>等）を使って装飾してください。
4. 在庫リストにぴったりのものがない場合は、リストの中から最も条件に近いものを勧めてください。

質問: ${message}
        `;

        let aiText = "";
        let success = false;

        // 💡 6つのキーを順番に試すループ
        for (const key of apiKeys) {
            const genAI = new GoogleGenerativeAI(key);
            
            for (const modelId of MODEL_CANDIDATES) {
                try {
                    const model = genAI.getGenerativeModel({ model: modelId });
                    const result = await model.generateContent(prompt);
                    aiText = result.response.text();
                    
                    if (aiText) {
                        success = true;
                        break;
                    }
                } catch (err: any) {
                    console.warn(`❌ Key末尾(${key.slice(-4)})/Model(${modelId})失敗: ${err.message}`);
                    // 次のモデルまたは次のキーへ
                    continue;
                }
            }
            if (success) break; // 生成できたらキーのループを抜ける
        }

        if (!success) throw new Error("すべてのAPIキーが制限に達したか、エラーが発生しました。");

        // 4. 回答の加工・製品抽出
        let productName = null;
        let productUrl = null;
        let productImage = null;

        const match = aiText.match(/RECOMMENDED_PRODUCT:(.*)/);
        if (match && match[1]) {
            const recommendedName = match[1].trim();
            const found = allProducts.find(p => {
                const pName = (p.name || p.title || "").toLowerCase();
                return recommendedName.toLowerCase().includes(pName) || pName.includes(recommendedName.toLowerCase());
            });

            if (found) {
                productName = found.name || found.title;
                productUrl = found.url || found.affiliate_url;
                productImage = found.image_url || found.image || null;
            }
        }

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
        console.error("🚨 Final AI Error:", error.message);
        return NextResponse.json({ 
            text: "申し訳ありません。現在システムが大変混み合っております。しばらく経ってから再度お試しください。" 
        }, { status: 500 });
    }
}