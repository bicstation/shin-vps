'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';

type Props = {
  score_cpu?: number;
  score_gpu?: number;
  score_cost?: number;
  score_portable?: number;
  score_ai?: number;
};

export default function ScoreRadarChart({
  score_cpu = 0,
  score_gpu = 0,
  score_cost = 0,
  score_portable = 0,
  score_ai = 0,
}: Props) {

  const data = [
    { subject: 'CPU性能', value: score_cpu },
    { subject: 'GPU性能', value: score_gpu },
    { subject: 'コスパ', value: score_cost },
    { subject: '携帯性', value: score_portable },
    { subject: 'AI性能', value: score_ai },
  ];

  return (
    <div className="w-full flex justify-center mt-6 mb-2">
      <div className="w-[240px] h-[240px] opacity-90">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <Radar
              dataKey="value"
              stroke="#fb923c"
              fill="#fb923c"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}