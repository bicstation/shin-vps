'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

type Props = {
  data: {
    subject: string;
    value: number;
    fullMark: number;
  }[];
};

export default function ProductRadarChart({ data }: Props) {
  if (!data || !data.length) return null;

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar
            name="性能"
            dataKey="value"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}