'use client';

import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PriceHistoryChartProps {
  // history の中身を価格と順位の両方に対応できるよう汎用的に定義
  history: { date: string; price?: number; rank?: number; [key: string]: any }[];
  isRank?: boolean; // 順位モードかどうかのフラグ
}

export default function PriceHistoryChart({ history, isRank = false }: PriceHistoryChartProps) {
  const [range, setRange] = useState<'1M' | '3M' | 'ALL'>('ALL');

  // 選択された期間に基づいてデータをフィルタリング
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    if (range === 'ALL') return history;

    const now = new Date();
    const cutoff = new Date();
    if (range === '1M') cutoff.setMonth(now.getMonth() - 1);
    if (range === '3M') cutoff.setMonth(now.getMonth() - 3);

    return history.filter(item => {
      const itemDate = new Date(item.date.replace(/\//g, '-'));
      return itemDate >= cutoff;
    });
  }, [history, range]);

  // チャート用データの設定
  const data = {
    labels: filteredHistory.map(h => h.date),
    datasets: [
      {
        label: isRank ? '順位' : '価格',
        // isRankがtrueなら rank フィールドを、falseなら price フィールドを使用
        data: filteredHistory.map(h => (isRank ? h.rank : h.price)),
        borderColor: isRank ? '#10b981' : '#2563eb', // 順位は緑、価格は青
        backgroundColor: isRank ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: filteredHistory.length > 30 ? 0 : 4,
        pointBackgroundColor: isRank ? '#10b981' : '#2563eb',
      },
    ],
  };

  // チャートのオプション設定
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: (context) => {
            const val = context.parsed.y;
            return isRank ? ` ${val}位` : ` ¥${val.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        reverse: isRank, // ★重要: 順位の場合は 1位が一番上に来るように軸を反転
        beginAtZero: !isRank, // 価格は0から、順位はデータに合わせる
        ticks: {
          callback: (value) => {
            if (isRank) return `${value}位`;
            return `¥${Number(value).toLocaleString()}`;
          }
        }
      }
    }
  };

  // ボタンのスタイル（Tailwind CSS）
  const btnStyle = (active: boolean) => `
    px-3 py-1 text-xs font-bold rounded-full transition-all border
    ${active 
      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
  `;

  return (
    <div className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {isRank ? '順位推移' : '価格推移'}
        </h3>
        <div className="flex gap-2">
          {(['1M', '3M', 'ALL'] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={btnStyle(range === r)}>
              {r === 'ALL' ? '全期間' : r}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[250px] w-full">
        {filteredHistory.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            データが不足しています
          </div>
        )}
      </div>
    </div>
  );
}