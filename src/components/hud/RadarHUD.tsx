'use client';

import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer
} from 'recharts';
import { EstadisticasBase } from '@/types/character';

export default function RadarHUD({ stats, color }: { stats: EstadisticasBase; color: string }) {
  const data = [
    { stat: 'COMBATE', value: stats.COMBATE },
    { stat: 'VIGOR', value: stats.VIGOR },
    { stat: 'MOVILIDAD', value: stats.MOVILIDAD },
    { stat: 'CARISMA', value: stats.CARISMA },
    { stat: 'INTELECTO', value: stats.INTELECTO },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data} margin={{ top: 14, right: 36, bottom: 14, left: 36 }}>
        <PolarGrid stroke="rgba(58,87,122,0.4)" />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fill: '#8fa8c8', fontSize: 10, fontFamily: 'Orbitron, monospace', fontWeight: 600 }}
        />
        <Radar name="stats" dataKey="value" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} dot={{ fill: color, r: 3 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
