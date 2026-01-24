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
  ChartOptions,
  Tick
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PriceHistoryChartProps {
  /** * history: [{ date: "01/24", price: 150000 }] などの形式
   * 順位データの場合も、便宜上 price というキーで数値が入っていることを想定
   */
  history: { date: string; price?: number; rank?: number; [key: string]: any }[];
  isRank?: boolean; // 順位モード（軸反転・緑色）
}

export default function PriceHistoryChart({ history, isRank = false }: PriceHistoryChartProps) {
  const [range, setRange] = useState<'1M' | '3M' | 'ALL'>('ALL');

  // 1. 期間フィルタリング
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    if (range === 'ALL') return history;

    const now = new Date();
    const cutoff = new Date();
    if (range === '1M') cutoff.setMonth(now.getMonth() - 1);
    if (range === '3M') cutoff.setMonth(now.getMonth() - 3);

    return history.filter(item => {
      // "MM/DD" 形式の場合、年を補完してパース
      const dateStr = item.date.includes('/') && item.date.length <= 5 
        ? `${new Date().getFullYear()}/${item.date}` 
        : item.date;
      const itemDate = new Date(dateStr.replace(/\//g, '-'));
      return itemDate >= cutoff;
    });
  }, [history, range]);

  // 2. チャートデータ作成
  const data = {
    labels: filteredHistory.map(h => h.date),
    datasets: [
      {
        label: isRank ? '順位' : '価格',
        // ページ側で rank を price キーにマッピングして渡してくるケースも考慮
        data: filteredHistory.map(h => {
          const val = isRank ? (h.rank ?? h.price) : h.price;
          return val || null;
        }),
        borderColor: isRank ? '#10b981' : '#2563eb', // 順位：エメラルド, 価格：ブルー
        backgroundColor: isRank ? 'rgba(16, 185, 129, 0.05)' : 'rgba(37, 99, 235, 0.05)',
        fill: true,
        tension: 0.4, // 少し滑らかに
        pointRadius: filteredHistory.length > 31 ? 0 : 4,
        pointHitRadius: 10,
        pointBackgroundColor: isRank ? '#10b981' : '#2563eb',
        borderWidth: 2,
      },
    ],
  };

  // 3. チャートオプション
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 12 },
        bodyFont: { size: 14, weight: 'bold' },
        callbacks: {
          label: (context) => {
            const val = context.parsed.y;
            if (val === null) return ' データなし';
            return isRank ? ` 注目度: ${val}位` : ` 価格: ¥${val.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#94a3b8' }
      },
      y: {
        reverse: isRank, // ★重要: 1位を一番上に表示
        beginAtZero: !isRank,
        // 順位の場合、目盛りを整数に限定
        ticks: {
          stepSize: isRank ? 1 : undefined,
          font: { size: 11 },
          color: '#94a3b8',
          callback: function(this, value) {
            if (isRank) return `${value}位`;
            return `¥${Number(value).toLocaleString()}`;
          }
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
        }
      }
    }
  };

  // ボタンボタンスタイル
  const btnStyle = (active: boolean) => `
    px-4 py-1.5 text-[11px] font-bold rounded-full transition-all border
    ${active 
      ? 'bg-gray-800 text-white border-gray-800 shadow-sm' 
      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
  `;

  return (
    <div className="w-full bg-white rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-4 rounded-full ${isRank ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
          <span className="text-xs font-bold text-gray-700 tracking-tight">
            {isRank ? 'RANKING TREND' : 'PRICE HISTORY'}
          </span>
        </div>
        <div className="flex gap-1.5">
          {(['1M', '3M', 'ALL'] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={btnStyle(range === r)}>
              {r === 'ALL' ? 'ALL' : r}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        {filteredHistory.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <span className="text-gray-400 text-xs">十分なデータが蓄積されていません</span>
          </div>
        )}
      </div>

      {isRank && (
        <p className="mt-3 text-[10px] text-gray-400 text-right">
          ※ BICSTATION内の閲覧・比較データに基づく独自順位
        </p>
      )}
    </div>
  );
}