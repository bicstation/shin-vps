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
  history: { date: string; price: number }[];
}

export default function PriceHistoryChart({ history }: PriceHistoryChartProps) {
  const [range, setRange] = useState<'1M' | '3M' | 'ALL'>('ALL');

  // 選択された期間に基づいてデータをフィルタリング
  const filteredHistory = useMemo(() => {
    if (range === 'ALL') return history;

    const now = new Date();
    const cutoff = new Date();
    if (range === '1M') cutoff.setMonth(now.getMonth() - 1);
    if (range === '3M') cutoff.setMonth(now.getMonth() - 3);

    return history.filter(item => {
      const itemDate = new Date(item.date.replace(/\//g, '-')); // YYYY/MM/DD をパース可能に
      return itemDate >= cutoff;
    });
  }, [history, range]);

  const data = {
    labels: filteredHistory.map(h => h.date),
    datasets: [
      {
        label: '価格',
        data: filteredHistory.map(h => h.price),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: filteredHistory.length > 30 ? 0 : 4, // データが多い時は点を消してスッキリさせる
        pointBackgroundColor: '#2563eb',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: { label: (context) => ` ¥${context.parsed.y.toLocaleString()}` }
      }
    },
    scales: {
      y: { ticks: { callback: (value) => `¥${value.toLocaleString()}` } }
    }
  };

  // ボタンのスタイル
  const btnStyle = (active: boolean) => `
    px-3 py-1 text-xs font-bold rounded-full transition-all border
    ${active 
      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
  `;

  return (
    <div className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">価格推移</h3>
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
            この期間のデータはありません
          </div>
        )}
      </div>
    </div>
  );
}