'use client';

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis,
} from 'recharts';
import { EstadisticasBase, calcularModificador } from '@/types/character';

interface Props {
  stats: EstadisticasBase;
  color: string;
}

export default function RadarHUD({ stats, color }: Props) {
  const data = [
    { attr: 'FUE', val: stats.fuerza,       fullMark: 20 },
    { attr: 'DES', val: stats.destreza,      fullMark: 20 },
    { attr: 'CON', val: stats.constitucion,  fullMark: 20 },
    { attr: 'INT', val: stats.inteligencia,  fullMark: 20 },
    { attr: 'SAB', val: stats.sabiduria,     fullMark: 20 },
    { attr: 'CAR', val: stats.carisma,       fullMark: 20 },
  ];

  const CustomLabel = ({ x, y, payload }: any) => {
    const key = payload.value;
    const statMap: Record<string, keyof EstadisticasBase> = {
      FUE: 'fuerza', DES: 'destreza', CON: 'constitucion',
      INT: 'inteligencia', SAB: 'sabiduria', CAR: 'carisma',
    };
    const val = stats[statMap[key]];
    const mod = calcularModificador(val);
    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;

    return (
      <g>
        <text
          x={x} y={y - 8}
          textAnchor="middle"
          fill={color}
          style={{ fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.1em' }}
        >
          {key}
        </text>
        <text
          x={x} y={y + 4}
          textAnchor="middle"
          fill="rgba(180,160,100,0.9)"
          style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', fontWeight: 'bold' }}
        >
          {val}
        </text>
        <text
          x={x} y={y + 16}
          textAnchor="middle"
          fill={`${color}99`}
          style={{ fontFamily: 'Orbitron, monospace', fontSize: '8px' }}
        >
          {modStr}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} margin={{ top: 30, right: 40, bottom: 30, left: 40 }}>
        <PolarGrid
          gridType="polygon"
          stroke={`${color}20`}
          strokeWidth={1}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 20]}
          tick={false}
          axisLine={false}
        />
        <PolarAngleAxis
          dataKey="attr"
          tick={(props) => <CustomLabel {...props} />}
          tickLine={false}
        />
        <Radar
          name="stats"
          dataKey="val"
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          strokeWidth={1.5}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
