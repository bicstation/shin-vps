'use client';

import React from 'react';
import {
  Radar as ReChartsRadar,
  RadarChart as ReChartsRadarContainer,
  PolarGrid as ReChartsPolarGrid,
  PolarAngleAxis as ReChartsPolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

/**
 * 💡 型定義
 */
interface RadarChartProps {
  data: {
    subject: string;
    value: number;
    fullMark: number;
  }[];
  color?: string;
}

/**
 * 🚀 【重要】ビルドエラー完全回避策
 * Next.jsのビルドプロセスにおける ReactNode / bigint の型競合を避けるため、
 * 全ての Recharts コンポーネントを any としてキャストします。
 */
const TypedResponsiveContainer = ResponsiveContainer as any;
const TypedRadarChartContainer = ReChartsRadarContainer as any;
const TypedPolarGrid = ReChartsPolarGrid as any;
const TypedPolarAngleAxis = ReChartsPolarAngleAxis as any;
const TypedRadar = ReChartsRadar as any;

const RadarChart = ({ data, color = "#3182ce" }: RadarChartProps) => {
  // データが空の場合のガード
  if (!data || data.length === 0) {
    return <div style={{ width: '100%', height: 160 }} />;
  }

  return (
    <div style={{ width: '100%', height: 160, position: 'relative' }}>
      <TypedResponsiveContainer width="100%" height="100%">
        <TypedRadarChartContainer cx="50%" cy="50%" outerRadius="75%" data={data}>
          
          {/* 背景のグリッド網 */}
          <TypedPolarGrid stroke="#e2e8f0" />
          
          {/* 各項目のラベル軸 */}
          <TypedPolarAngleAxis 
            dataKey="subject" 
            tick={{ 
              fill: '#718096', 
              fontSize: 10, 
              fontWeight: 'bold' 
            }} 
          />
          
          {/* レーダーの描画エリア */}
          <TypedRadar
            name="Spec Score"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.5}
            isAnimationActive={true}
            animationDuration={1000}
          />
          
        </TypedRadarChartContainer>
      </TypedResponsiveContainer>
    </div>
  );
};

export default RadarChart;