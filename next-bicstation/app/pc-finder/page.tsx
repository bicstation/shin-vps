/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PCFinderClient() {

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [result, setResult] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [error, setError] = useState(false);

  /** 🔥 API（フォールバック付き） */
  const API =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8083';

  /** 🔥 質問 */
  const questions = [
    {
      key: 'purpose',
      text: 'PCの用途は？',
      options: [
        { label: 'ゲーム', value: 'gaming' },
        { label: '仕事', value: 'business' },
        { label: '動画編集・重い作業', value: 'creative' },
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

  /** 🔥 回答処理 */
  const handleAnswer = (key: string, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);

    setStep((prev) => {
      const nextStep = prev + 1;

      if (nextStep < questions.length) {
        return nextStep;
      } else {
        runDiagnosis(next);
        return prev;
      }
    });
  };

  /**
   * 🔥 診断
   *
   * ✔ APIがある場合 → API使用
   * ✔ APIが死んでる場合 → ダミーで動作
   *
   * 👉 開発止まらない設計
   */
  const runDiagnosis = async (answers: any) => {
    setIsDiagnosing(true);
    setLoading(true);
    setError(false);

    try {
      const res = await fetch(`${API}/api/products/diagnose/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });

      const data = await res.json();

      if (!data || !data.best) {
        throw new Error('no result');
      }

      setResult(data.best);
      setAlternatives(data.alternatives || []);
    } catch (e) {
      console.warn('⚠️ API失敗 → ダミーで動作');

      /**
       * 🔥 フォールバック（超重要）
       *
       * 👉 APIがなくてもUI確認できる
       * 👉 本番でも「真っ黒」にならない
       */
      setResult({
        unique_id: "sample-pc",
        title: "OMEN 16 ハイパフォーマンスモデル",
        image: "https://jp.ext.hp.com/content/dam/jp-ext-hp-com/jp/ja/ec/lib/products/personal/omen/omen16/omen16_2023.png",
        price: 219800,
        url: "#",
      });

      setAlternatives([
        {
          unique_id: "alt1",
          title: "dynabook 高性能モデル",
          shortTitle: "dynabook",
          price: 159800,
        },
        {
          unique_id: "alt2",
          title: "ASUS ゲーミングPC",
          shortTitle: "ASUS",
          price: 249800,
        }
      ]);

      setError(true); // ← デバッグ用
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
    setIsDiagnosing(false);
    setError(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">

      {/* 🔥 HERO */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">
          もう比較しなくていい
        </h1>
        <p className="text-sm text-gray-400">
          2つの質問で最適な1台が決まります
        </p>
      </div>

      {/* 🔥 質問 */}
      {!result && !loading && !isDiagnosing && questions[step] && (
        <div className="max-w-md mx-auto">

          <p className="mb-4 text-center font-bold">
            {questions[step].text}
          </p>

          <div className="grid gap-3">
            {questions[step].options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(questions[step].key, opt.value)}
                className="bg-cyan-500 text-black py-3 rounded-xl font-bold"
              >
                {opt.label}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* 🔄 ローディング（真っ黒防止） */}
      {(loading || isDiagnosing) && !result && (
        <div className="text-center mt-6 text-cyan-400 animate-pulse">
          最適な構成を選定中...
        </div>
      )}

      {/* ⚠️ デバッグ表示 */}
      {error && (
        <div className="text-center text-yellow-400 text-xs mt-2">
          ※API未接続のためダミー表示
        </div>
      )}

      {/* 🔥 結果 */}
      {result && (
        <div className="mt-8 max-w-md mx-auto">

          <p className="text-center text-xs text-gray-400">
            この条件ならこれ一択です
          </p>

          <h2 className="text-center text-lg font-bold mb-3">
            このPCで問題ありません
          </h2>

          <div className="bg-slate-900 rounded-2xl p-4 border border-cyan-500">

            <img
              src={result?.image}
              alt={result?.title || ''}
              className="w-full max-w-[300px] mx-auto rounded-xl"
            />

            <h3 className="mt-3 text-center font-bold">
              {result?.title}
            </h3>

            <div className="text-center text-xl font-bold mt-2">
              ¥{result?.price?.toLocaleString?.() || '---'}
            </div>

            {/* 🔥 CTA */}
            <a
              href={result?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 bg-cyan-500 text-black text-center py-3 rounded-xl font-bold"
            >
              👉 今すぐ最安価格を見る
            </a>

            <Link
              href={`/product/${result?.unique_id}`}
              className="block text-center text-xs text-gray-400 mt-2"
            >
              スペック詳細を見る
            </Link>

          </div>

          {/* 🔍 比較 */}
          {alternatives.length > 0 && (
            <div className="mt-6">

              <h3 className="text-sm text-gray-400 mb-2 text-center">
                他の候補も見る
              </h3>

              <div className="grid gap-3">
                {alternatives.map((p) => (
                  <Link
                    key={p.unique_id}
                    href={`/product/${p.unique_id}`}
                    className="block bg-slate-800 p-3 rounded-lg"
                  >
                    <div className="text-sm">
                      {p.shortTitle || p.title}
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