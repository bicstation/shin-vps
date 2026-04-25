import { GoogleGenerativeAI } from "@google/generative-ai";
import { requestQueue } from "@/shared/lib/queue";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean) as string[];

const PRIMARY_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemma-3-27b-it";

const MAX_RETRY = 3;
const BASE_DELAY = 1000;

const ARCHITECT_PERSONALITY = `あなたは超一流のPCアーキテクト。
日本語のみ・前置き禁止・Markdown厳守。`;

type KeyState = { fail: number; last: number };
const keyPool = new Map<string, KeyState>();

API_KEYS.forEach(k => keyPool.set(k, { fail: 0, last: 0 }));

function getBestKey() {
  return [...keyPool.entries()]
    .sort((a, b) => a[1].fail - b[1].fail || a[1].last - b[1].last)[0][0];
}

function markSuccess(key: string) {
  const s = keyPool.get(key)!;
  s.fail = Math.max(0, s.fail - 1);
  s.last = Date.now();
}

function markFail(key: string) {
  const s = keyPool.get(key)!;
  s.fail++;
  s.last = Date.now();
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function generate(
  key: string,
  modelName: string,
  prompt: string,
  useSystem: boolean,
  signal: AbortSignal
): Promise<string> {
  const ai = new GoogleGenerativeAI(key);

  const model = ai.getGenerativeModel({
    model: modelName,
    ...(useSystem ? { systemInstruction: ARCHITECT_PERSONALITY } : {}),
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.8,
    },
  });

  const input = useSystem ? prompt : `${ARCHITECT_PERSONALITY}\n\n${prompt}`;

  for (let i = 0; i < MAX_RETRY; i++) {
    if (signal.aborted) throw new Error("ABORTED");

    try {
      const res = await Promise.race([
        model.generateContent(input),
        new Promise((_, rej) => {
          const onAbort = () => {
            signal.removeEventListener("abort", onAbort);
            rej(new Error("ABORTED"));
          };
          signal.addEventListener("abort", onAbort);
        })
      ]);

      const text = (res as any).response.text();
      if (!text) throw new Error("EMPTY");

      return text.trim();
    } catch (err: any) {
      if (err.message === "ABORTED") throw err;

      if (err.message.includes("429")) {
        await sleep(BASE_DELAY * 2 ** i + Math.random() * 500);
        continue;
      }

      if (err.message.includes("500")) {
        await sleep(1000);
        continue;
      }

      throw err;
    }
  }

  throw new Error("RETRY_FAIL");
}

export async function POST(req: Request) {
  const { prompt, priority } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "EMPTY" }), { status: 400 });
  }

  return requestQueue.add(async (signal) => {
    let lastErr: any;

    // PRIMARY
    for (let i = 0; i < API_KEYS.length; i++) {
      const key = getBestKey();

      try {
        const text = await generate(key, PRIMARY_MODEL, prompt, true, signal);
        markSuccess(key);

        return new Response(JSON.stringify({
          content: text,
          model: PRIMARY_MODEL
        }), { status: 200 });

      } catch (err: any) {
        markFail(key);
        lastErr = err;
      }
    }

    // FALLBACK
    for (let key of API_KEYS) {
      try {
        const text = await generate(key, FALLBACK_MODEL, prompt, false, signal);

        return new Response(JSON.stringify({
          content: text,
          model: FALLBACK_MODEL
        }), { status: 200 });

      } catch {
        continue;
      }
    }

    throw new Error(lastErr?.message || "ALL_FAIL");

  }, {
    priority: priority ?? 0,
    timeoutMs: 300000 // ←ここ！！
  }).catch(err => {
    if (err.message === "ABORTED") {
      return new Response(JSON.stringify({ error: "TIMEOUT" }), { status: 408 });
    }

    return new Response(JSON.stringify({
      error: "FAIL",
      message: err.message
    }), { status: 500 });
  });
}