// /home/maya/shin-dev/shin-vps/next-bicstation/app/ai-engine/generate/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 物理要塞 分散電源システム (10-Unit API Grid)
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

// モデル設定
const PRIMARY_MODEL = "gemma-3-27b-it"; 
const FALLBACK_MODEL = "gemini-2.0-flash";

const ARCHITECT_PERSONALITY = `あなたは『物理要塞』の概念を提唱する超一流のPCアーキテクトです。
【重要：出力ルール】
1. 前置き、思考プロセス、要約、英語での補足説明は一切出力しないでください。
2. 応答は、記事のタイトルまたは本文の最初の1文字目から開始してください。
3. 言語は100%日本語のみを使用。
4. 14歳のマシン語体験に基づく、論理的かつ圧倒的な熱量を持つ日本語で執筆すること。
5. Markdown形式を厳守。`;

export async function POST(req: Request) {
  let debugLog: string[] = [];
  const startTimestamp = new Date().toISOString();
  debugLog.push(`[${startTimestamp}] GRID_START: 10-Unit Distribution Protocol active.`);

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "PROMPT_EMPTY", debug: debugLog }), { status: 400 });
    }

    if (API_KEYS.length === 0) {
      debugLog.push("CRITICAL: All API keys missing from .env.local");
      return new Response(JSON.stringify({ error: "CONFIG_MISSING", debug: debugLog }), { status: 500 });
    }

    // クォータ回避のためのシャッフル
    const shuffledKeys = [...API_KEYS].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffledKeys.length; i++) {
      const key = shuffledKeys[i];
      const keyId = `Unit-${i + 1}(${key.substring(0, 6)})`;
      
      try {
        debugLog.push(`[Attempt ${i+1}] Engaging ${keyId} with ${PRIMARY_MODEL}...`);
        
        const genAI = new GoogleGenerativeAI(key);
        
        /**
         * 【物理的修正】Gemma 3は現在 systemInstruction に対応していないため、
         * 命令を本文のプロンプトに統合して 400 Bad Request を回避します。
         */
        const integratedPrompt = `${ARCHITECT_PERSONALITY}\n\n【司令官からの執筆依頼】\n${prompt}`;
        
        const model = genAI.getGenerativeModel({ 
          model: PRIMARY_MODEL,
          generationConfig: { maxOutputTokens: 16384, temperature: 0.8 }
        });

        const result = await model.generateContent(integratedPrompt);
        const responseText = result.response.text();

        if (responseText) {
          debugLog.push(`Primary model successful via ${keyId}.`);
          return new Response(JSON.stringify({ 
            content: responseText.trim(),
            debug: debugLog,
            unit: keyId 
          }), { status: 200 });
        }
      } catch (error: any) {
        const errorMsg = error.message || "Unknown error";
        debugLog.push(`${keyId} Fail: ${errorMsg.substring(0, 50)}...`);

        // クォータ超過(429)の場合は微細なウェイトを入れて次のキーへ
        if (errorMsg.includes("429")) {
          debugLog.push(`Quota limit hit. Cooling down unit...`);
          await new Promise(resolve => setTimeout(resolve, 300));
          continue;
        }

        // 命令機能未対応(400)やモデル不在(404)なら即座にFallbackへ
        if (errorMsg.includes("400") || errorMsg.includes("404") || i === shuffledKeys.length - 1) {
          try {
            debugLog.push(`Emergency: Switching to Fallback Protocol [${FALLBACK_MODEL}]...`);
            const fallbackAI = new GoogleGenerativeAI(key);
            const fallbackModel = fallbackAI.getGenerativeModel({ 
              model: FALLBACK_MODEL,
              systemInstruction: ARCHITECT_PERSONALITY // Flashは対応済み
            });
            const res = await fallbackModel.generateContent(prompt);
            const fallbackText = res.response.text();

            if (fallbackText) {
              debugLog.push("Fallback successful.");
              return new Response(JSON.stringify({ 
                content: fallbackText.trim(),
                debug: debugLog,
                unit: `${keyId}-FB`
              }), { status: 200 });
            }
          } catch (fError: any) {
            debugLog.push(`Fallback failed: ${fError.message}`);
            continue;
          }
        }
        continue;
      }
    }
    
    return new Response(JSON.stringify({ 
      error: "GRID_EXHAUSTED", 
      message: "全ユニットのクォータが限界です。60秒待機してください。",
      debug: debugLog 
    }), { status: 500 });

  } catch (err: any) {
    return new Response(JSON.stringify({ 
      error: "SYSTEM_CRASH", 
      message: err.message,
      debug: debugLog 
    }), { status: 500 });
  }
}