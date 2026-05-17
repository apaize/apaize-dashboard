'use client';

// ============================================================
// 📈 LineChart — wrapper Recharts pour évolution temporelle
// ============================================================
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Props = {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
};

export function LineChart({ data, color = '#6ca8ff', height = 240 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          stroke="rgba(245,247,255,0.45)"
          fontSize={10}
        />
        <YAxis stroke="rgba(245,247,255,0.45)" fontSize={10} />
        <Tooltip
          contentStyle={{
            background: '#2a3050',
            border: '1px solid rgba(141,167,255,0.30)',
            borderRadius: 8,
            fontSize: 12,
            color: '#fff',
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ fill: color, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </RLineChart>
    </ResponsiveContainer>
  );
}
