'use client';

import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
// CSS Modulesのインポート
import styles from './SpecRadarChart.module.css';

// レーダーチャートに必要な要素を登録
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface SpecRadarChartProps {
  scores: {
    cpu: number;
    gpu: number;
    cost: number;
    portable: number;
    ai: number;
  };
}

export default function SpecRadarChart({ scores }: SpecRadarChartProps) {
  const data = {
    labels: ['CPU性能', 'GPU性能', 'コスパ', '携帯性', 'AI性能'],
    datasets: [
      {
        label: '評価スコア',
        data: [scores.cpu, scores.gpu, scores.cost, scores.portable, scores.ai],
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: '#2563eb',
        borderWidth: 2,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#2563eb',
      },
    ],
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: true, color: '#e5e7eb' },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20, display: false },
        grid: { color: '#e5e7eb' },
        pointLabels: {
          font: { size: 12, weight: 'bold' },
          color: '#4b5563'
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: (context) => ` ${context.label}: ${context.formattedValue}点`
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>スペック解析 (5軸評価)</h3>
      </div>
      <div className={styles.chartWrapper}>
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}