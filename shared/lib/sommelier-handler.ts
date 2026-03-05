import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

interface ActressSearchResult {
    actress_id: string;
    name: string;
    ai_description: string;
    image_url_large: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function handleSommelierRequest(req: NextRequest) {
    try {
        // history（会話履歴）をフロントから受け取る
        const { message, history = [] } = await req.json();

        // 1. Django側の検索エンドポイントへリクエスト (API_INTERNAL_URL を使用)
        const baseUrl = process.env.API_INTERNAL_URL || 'http://django-v3:8000';
        const djangoApiUrl = `${baseUrl}/api/actress-search/?q=${encodeURIComponent(message)}`;
        
        let actress: ActressSearchResult | null = null;
        try {
            const djangoRes = await fetch(djangoApiUrl, {
                headers: { 'Content-Type': 'application/json' },
                next: { revalidate: 30 } 
            });
            
            if (djangoRes.ok) {
                const searchData = await djangoRes.json();
                actress = searchData.results?.[0] || null;
            }
        } catch (dbError) {
            console.error('Django API Connection Error:', dbError);
        }

        // 2. Gemma 3 へのプロンプト（アダルトソムリエの人格設定）
        const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });
        
        const systemInstruction = `あなたは「tiper.live」の専属アダルトソムリエです。
5.9万人の女優データベースから、ユーザーの欲望や好みに合致する至高の一人を提案します。

【今回のマッチング結果】
名前: ${actress ? actress.name : "特定の候補なし"}
詳細: ${actress ? actress.ai_description : "現在のリクエストに直接合致するデータが見つかりません"}

【回答ガイドライン】
- 言葉遣いは「優雅」「洗練」「官能的」。単なる紹介ではなく、その女優の魅力をソムリエとして語ってください。
- 履歴（context）を読み取り、会話の流れを止めないでください（「他には？」「さっきの人より若い子が最高」などの指示に反応する）。
- 候補がいる場合、彼女の「ai_description」を基に、ユーザーの好みにどう応えるかを情熱的に説明してください。
- 候補がいない場合、落胆させず「貴方様の深層心理にある理想を、もう少し詳しくお聞かせいただけますか？」と優しく問いかけてください。
- 150文字以内で、最後は「彼女とのひとときはいかがでしょうか？」といった言葉で締めてください。`;

        // ✅ 会話履歴を Gemma にロード
        const chat = model.startChat({
            history: history.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            })),
        });

        // 最新のメッセージとシステム指示を送信
        const result = await chat.sendMessage(`${systemInstruction}\n\nユーザーの最新の要求: ${message}`);
        const aiResponseText = result.response.text();

        // 3. フロントエンドが期待する形式で返却
        return NextResponse.json({
            text: aiResponseText,
            ...(actress && {
                productName: actress.name,
                productUrl: `/actress/${actress.actress_id}/`,
                productImage: actress.image_url_large || '/images/default-item.png'
            })
        });

    } catch (error) {
        console.error('Sommelier Handler Critical Error:', error);
        return NextResponse.json({ 
            text: "今夜は少々混み合っているようです。素敵な出会いをご用意しますので、少々お時間をいただけますか？" 
        }, { status: 500 });
    }
}