import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

/**
 * 💡 Gemini APIの設定
 * .env.local に GEMINI_API_KEY=あなたのキー を設定してください。
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            console.error("APIキーが設定されていません。");
            return NextResponse.json(
                { text: "システム設定エラーです。管理者にお問い合わせください。" },
                { status: 500 }
            );
        }

        // モデルの初期化 (高速でコスパの良い 1.5-flash を使用)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            // 🤖 システム指示: AIの役割を定義します
            systemInstruction: `
                あなたはPC専門ポータルサイト「BICSTATION（ビックステーション）」の公認コンシェルジュです。
                
                【役割】
                - ユーザーの予算や用途（ゲーム、ビジネス、動画編集など）に合ったPC選びをサポートします。
                - PCのスペック（CPU, メモリ, GPU, ストレージ）に関する疑問に専門家として答えます。
                
                【トーン】
                - 親切でフレンドリー、かつプロフェッショナルな対応を心がけてください。
                - 初心者の方には専門用語を噛み砕いて説明してください。
                
                【制約】
                - 分からないことは無理に答えず、確認が必要な旨を伝えてください。
                - BICSTATIONのスタッフとして、常にユーザーに寄り添った提案を行ってください。
            `,
        });

        // ユーザーからのメッセージを送信して回答を生成
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        // 正常な回答をJSONで返す
        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("Gemini API Error:", error);

        // エラー時のユーザー向けメッセージ
        return NextResponse.json(
            { text: "申し訳ありません。少し考え込んでしまいました。もう一度質問していただけますか？" },
            { status: 500 }
        );
    }
}