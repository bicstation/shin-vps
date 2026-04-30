/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/shared/lib/track';

export default function PCFinderClient() {

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [error, setError] = useState(false);

  const API =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8083';

  /** 🔥 質問 */
  const questions = [
    {
      key: 'purpose',
      text: 'PCの用途は？',
      options: [
        { label: '🎮 ゲーム', value: 'gaming' },
        { label: '💼 仕事', value: 'business' },
        { label: '🎬 動画編集', value: 'creative' },
      ],
    },
    {
      key: 'budget',
      text: '予算は？',
      options: [
        { label: '〜15万円', value: 'low' },
        { label: '〜30万円', value: 'mid' },
        { label: '30万円以上', value: 'high' },
      ],
    },
  ];

  /** 🔥 回答 */
  const handleAnswer = (key: string, value: string) => {

    trackEvent('finder_answer', { key, value });

    const next = { ...answers, [key]: value };
    setAnswers(next);

    const nextStep = step + 1;

    if (nextStep < questions.length) {
      setStep(nextStep);
    } else {
      trackEvent('finder_start');
      runDiagnosis(next);
    }
  };

  /** 🔥 診断 */
  const runDiagnosis = async (answers: any) => {

    trackEvent('finder_diagnose', answers);

    setLoading(true);
    setError(false);

    try {
      const res = await fetch(`${API}/api/products/diagnose/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });

      const data = await res.json();

      trackEvent('finder_result', {
        product_id: data.best?.unique_id,
        price: data.best?.price,
      });

      setResult(data.best);
      setAlternatives(data.alternatives || []);

    } catch {
      trackEvent('finder_error');

      // 🔥 ダミー
      setResult({
        unique_id: "sample",
        title: "OMEN 16 ハイパフォーマンスモデル",
        image: "https://jp.ext.hp.com/content/dam/jp-ext-hp-com/jp/ja/ec/lib/products/personal/omen/omen16/omen16_2023.png",
        price: 219800,
        url: "#",
        reason: "・RTX搭載で最新ゲームも快適・この価格帯で最も性能が高い"
      });

      setAlternatives([
        {
          unique_id: "alt1",
          shortTitle: "ASUS ゲーミングPC",
          price: 179800,
        },
        {
          unique_id: "alt2",
          shortTitle: "HP Pavilion",
          price: 149800,
        }
      ]);

      setError(true);
    }

    setLoading(false);
  };

  /** 🔁 リセット */
  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setAlternatives([]);
    setLoading(false);
    setError(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">

      {/* 🔥 タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">
          もう比較しなくていい
        </h1>
        <p className="text-sm text-gray-400">
          2つの質問で最適な1台が決まります
        </p>
      </div>

      {/* 🔥 質問 */}
      {!result && !loading && questions[step] && (
        <div className="max-w-md mx-auto">

          <p className="mb-4 text-center font-bold">
            {questions[step].text}
          </p>

          <div className="grid gap-3">
            {questions[step].options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(questions[step].key, opt.value)}
                className="bg-cyan-500 text-black py-3 rounded-xl font-bold hover:bg-cyan-400 transition"
              >
                {opt.label}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* 🔄 ローディング */}
      {loading && !result && (
        <div className="text-center mt-6 text-cyan-400 animate-pulse">
          最適な構成を選定中...
        </div>
      )}

      {/* ⚠️ エラー */}
      {error && (
        <div className="text-center text-yellow-400 text-xs mt-2">
          ※現在デモ表示です
        </div>
      )}

      {/* 🔥 結果 */}
      {result && (
        <div className="mt-8 max-w-md mx-auto">

          <div className="bg-slate-900 rounded-2xl p-5 border border-cyan-500">

            <p className="text-xs text-cyan-400 text-center font-bold">
              🔥 あなたに最適なPC
            </p>

            <h2 className="text-center text-lg font-bold mt-1">
              {result.title}
            </h2>

            <img
              src={result.image}
              className="w-full max-w-[300px] mx-auto mt-3 rounded-xl"
            />

            <div className="text-center text-2xl font-bold mt-3">
              ¥{result.price?.toLocaleString?.()}
            </div>

            {/* 理由 */}
            <div className="mt-3 text-sm text-gray-300 text-center">
              {(result.reason || '').split('・').map((line, i) => (
                line && <div key={i}>✔ {line}</div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-500 mt-3">
              この条件ならこれ以外を選ぶ理由はありません
            </p>

            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent('finder_cta_click', {
                  product_id: result.unique_id,
                  price: result.price,
                })
              }
              className="block mt-4 bg-cyan-500 text-black text-center py-3 rounded-xl font-bold hover:bg-cyan-400"
            >
              👉 今すぐ在庫と価格を確認する
            </a>

          </div>

          {/* 🔍 比較 */}
          {alternatives.length > 0 && (
            <div className="mt-6">

              <h3 className="text-sm text-gray-400 mb-2 text-center">
                最後に比較されているモデル
              </h3>

              <div className="grid gap-3">
                {alternatives.map((p) => (
                  <Link
                    key={p.unique_id}
                    href={`/product/${p.unique_id}`}
                    onClick={() =>
                      trackEvent('finder_alt_click', {
                        product_id: p.unique_id,
                      })
                    }
                    className="block bg-slate-800 p-3 rounded-lg hover:bg-slate-700"
                  >
                    <div className="text-sm font-semibold">
                      {p.shortTitle}
                    </div>

                    <div className="text-xs text-gray-400">
                      ¥{p.price?.toLocaleString?.()}
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          )}

          {/* 🔁 再診断 */}
          <div className="text-center mt-6">
            <button
              onClick={reset}
              className="text-xs text-gray-500"
            >
              条件を変えてやり直す
            </button>
          </div>

        </div>
      )}

    </div>
  );
}