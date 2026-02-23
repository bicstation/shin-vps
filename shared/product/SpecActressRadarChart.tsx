// -*- coding: utf-8 -*-
// components/SpecRadarChart.tsx
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
import styles from './SpecActressRadarChart.module.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface SpecRadarChartProps {
  scores: {
    visual: number;
    style: number;
    performance: number;
    popularity: number;
    potential: number;
  };
}

export default function SpecRadarChart({ scores }: SpecRadarChartProps) {
  // 💡 0点の場合でも解析形状を維持するため最小値を保証
  const chartValues = [
    scores.visual || 30,
    scores.style || 30,
    scores.performance || 30,
    scores.popularity || 30,
    scores.potential || 30
  ];

  const data = {
    labels: ['ルックス', 'スタイル', '表現力', '人気度', '将来性'],
    datasets: [
      {
        label: 'AI解析スコア',
        data: chartValues,
        backgroundColor: 'rgba(0, 242, 254, 0.2)', 
        borderColor: '#00f2fe',
        borderWidth: 2,
        pointBackgroundColor: '#00f2fe',
        pointBorderColor: '#fff',
        pointRadius: 2,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: true, color: 'rgba(255, 255, 255, 0.1)' },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20, display: false },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        pointLabels: {
          font: { size: 9, weight: 'bold' },
          color: '#8e8e93',
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: (context) => ` ${context.label}: ${context.formattedValue}pts`
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}