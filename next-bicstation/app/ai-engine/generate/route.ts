import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 物理要塞の分散電源システム: 10個のキーをランダムにスイッチして負荷を分散
 */
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
  process.env.GEMINI_API_KEY_7,
  process.env.GEMINI_API_KEY_8,
  process.env.GEMINI_API_KEY_9,
  process.env.GEMINI_API_KEY_10,
].filter(Boolean) as string[];

// 司令官の指示に基づき gemma-3-27b-it をメインに据える
const PRIMARY_MODEL = "gemma-3-27b-it"; 
const FALLBACK_MODEL = "gemini-2.0-flash";

const PURE_JAPANESE_INSTRUCTION = `あなたは『物理要塞』の概念を提唱する超一流のPCアーキテクトです。
【重要：出力ルール】
1. 前置き、思考プロセス、要約、英語での補足説明（"Persona:", "Task:" など）は一切出力しないでください。
2. 応答は、記事のタイトルまたは本文の最初の1文字目から開始してください。
3. 言語は100%日本語のみを使用してください。
4. 14歳のマシン語体験に基づく、論理的かつ圧倒的な熱量を持つ日本語で執筆してください。
5. Markdown形式を厳守してください。`;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return new Response(JSON.stringify({ error: "No prompt" }), { status: 400 });
    if (API_KEYS.length === 0) return new Response(JSON.stringify({ error: "API KEYS MISSING" }), { status: 500 });

    const shuffledKeys = [...API_KEYS].sort(() => Math.random() - 0.5);

    for (const key of shuffledKeys) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ 
          model: PRIMARY_MODEL,
          systemInstruction: PURE_JAPANESE_INSTRUCTION,
          generationConfig: { 
            maxOutputTokens: 32768, 
            temperature: 0.8,
          }
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (text) {
          return new Response(JSON.stringify({ text: text.trim() }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error: any) {
        console.warn(`Unit fail (${key.substring(0, 8)}...): ${error.message}`);
        if (error.message.includes("404") || error.message.includes("403")) {
          try {
            const genAI = new GoogleGenerativeAI(key);
            const fallback = genAI.getGenerativeModel({ 
              model: FALLBACK_MODEL,
              systemInstruction: PURE_JAPANESE_INSTRUCTION
            });
            const res = await fallback.generateContent(prompt);
            return new Response(JSON.stringify({ text: res.response.text().trim() }), { status: 200 });
          } catch { continue; }
        }
        continue; 
      }
    }
    return new Response(JSON.stringify({ error: "ALL UNITS OVERLOADED" }), { status: 500 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "CRITICAL SYSTEM ERROR" }), { status: 500 });
  }
}