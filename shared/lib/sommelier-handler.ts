import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// データベースからのレスポンス型定義
interface ActressSearchResult {
    actress_id: string;
    name: string;
    ai_description: string;
    image_url_large: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * 🤖 AIソムリエ・ロジック本体
 * Django APIと連携し、5.9万人のDBから最適な女優をレコメンドします。
 */
export async function handleSommelierRequest(req: NextRequest) {
    try {
        const { message } = await req.json();

        // 1. Django側の検索エンドポイントへリクエスト
        // 環境変数 DJANGO_URL (例: http://localhost:8000) を使用
        const djangoApiUrl = `${process.env.DJANGO_URL}/api/actress-search/?q=${encodeURIComponent(message)}`;
        
        let actress: ActressSearchResult | null = null;
        try {
            const djangoRes = await fetch(djangoApiUrl, {
                headers: { 'Content-Type': 'application/json' },
                // 検索結果は動的なためキャッシュ時間は短めに設定（Next.js機能）
                next: { revalidate: 30 } 
            });
            
            if (djangoRes.ok) {
                const searchData = await djangoRes.json();
                // Django側が results 配列で返す想定
                actress = searchData.results?.[0] || null;
            }
        } catch (dbError) {
            console.error('Django API Connection Error:', dbError);
            // DBがダウンしていてもAIの会話自体は止めないようフォールバック
        }

        // 2. Gemma 3 へのプロンプト（ソムリエの人格設定）
        const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });
        
        const systemInstruction = `あなたは「tiper.live」の専属AIコンシェルジュ（ソムリエ）です。
5.9万人の膨大な女優データベースを背景に、ユーザーの曖昧なリクエストに最適な一人を提案します。

【今回のマッチング結果】
名前: ${actress ? actress.name : "該当なし"}
詳細データ: ${actress ? actress.ai_description : "条件に一致する特定の女優がDBで見つかりませんでした"}

【回答ガイドライン】
- 候補がいる場合、その人の「ai_description」の内容を引用しつつ、なぜ彼女がユーザーのリクエストに合致するのかを優雅に説明してください。
- 候補がいない場合、謝罪するのではなく「もう少し具体的に、例えば『清楚系』や『癒やし系』といったお好みはありますか？」と、検索を絞り込むための対話を促してください。
- トーンは洗練された大人な雰囲気で。
- 150文字以内で、最後は「こちらの方はいかがでしょうか？」といった言葉で締めてください。`;

        const result = await model.generateContent([
            { text: systemInstruction },
            { text: `ユーザーからのリクエスト: ${message}` }
        ]);
        
        const aiResponseText = result.response.text();

        // 3. フロントエンドの ChatInner が処理できる形式でレスポンス
        return NextResponse.json({
            text: aiResponseText,
            // カード表示用の情報を付与（actressが存在する場合のみ）
            ...(actress && {
                productName: actress.name,
                productUrl: `/actress/${actress.actress_id}/`,
                productImage: actress.image_url_large || '/images/default-item.png'
            })
        });

    } catch (error) {
        console.error('Sommelier Handler Critical Error:', error);
        return NextResponse.json({ 
            text: "申し訳ありません。現在コンシェルジュが混み合っております。少し時間を置いてから再度お試しください。" 
        }, { status: 500 });
    }
}