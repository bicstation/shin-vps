'use client';

import React, { useEffect, useState } from 'react';
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
 */
const TypedResponsiveContainer = ResponsiveContainer as any;
const TypedRadarChartContainer = ReChartsRadarContainer as any;
const TypedPolarGrid = ReChartsPolarGrid as any;
const TypedPolarAngleAxis = ReChartsPolarAngleAxis as any;
const TypedRadar = ReChartsRadar as any;

const RadarChart = ({ data, color = "#3182ce" }: RadarChartProps) => {
  // 💡 クライアントサイドでのマウント状態を管理（警告回避用）
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // データが空の場合、またはマウント前はプレースホルダーを返す
  if (!isMounted || !data || data.length === 0) {
    return <div style={{ width: '100%', height: 160 }} />;
  }

  return (
    <div style={{ width: '100%', height: 160, position: 'relative' }}>
      {/* 💡 minWidth={0} を追加することで ResponsiveContainer の計算エラーを抑制します。
          さらに isMounted でクライアント側でのみ描画を確定させます。
      */}
      <TypedResponsiveContainer width="100%" height="100%" minWidth={0}>
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