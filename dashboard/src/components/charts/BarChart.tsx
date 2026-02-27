'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
const COLORS = {
  completed: '#0B2D68',
  pending: '#F5B452',
  failed: '#F05F77',
};

type ChartDataPoint = {
  name: string;
  completed: number;
  pending: number;
  failed: number;
};

type Props = {
  data?: ChartDataPoint[];
};

const FALLBACK: ChartDataPoint[] = [
  { name: 'Mon', completed: 64, pending: 26, failed: 10 },
  { name: 'Tue', completed: 58, pending: 24, failed: 18 },
  { name: 'Wed', completed: 60, pending: 22, failed: 18 },
  { name: 'Thu', completed: 54, pending: 26, failed: 20 },
  { name: 'Fri', completed: 66, pending: 20, failed: 14 },
  { name: 'Sat', completed: 48, pending: 30, failed: 22 },
  { name: 'Sun', completed: 52, pending: 28, failed: 20 },
];

export default function BarChartComponent({ data }: Props) {
  const chartData = data && data.length ? data : FALLBACK;

  return (
    <ChartContainer
      config={{
        completed: { label: 'Completed', color: COLORS.completed },
        pending: { label: 'Pending', color: COLORS.pending },
        failed: { label: 'Failed', color: COLORS.failed },
      }}
      className='w-full h-full'
    >
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={chartData} barGap={4} barCategoryGap='45%'>
          <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#E5E7EB' />
          <XAxis
            dataKey='name'
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 11 }}
            tickFormatter={(value) => `${value}%`}
            ticks={[0, 20, 40, 60, 80, 100]}
            domain={[0, 100]}
            width={40}
          />
          <ChartTooltip
            cursor={{ fill: '#F1F5F9' }}
            content={<ChartTooltipContent formatter={(value: unknown) => `${value}%`} />}
          />
          <Bar dataKey='completed' stackId='a' fill={COLORS.completed} radius={[0, 0, 0, 0]} maxBarSize={18} />
          <Bar dataKey='pending' stackId='a' fill={COLORS.pending} radius={[0, 0, 0, 0]} maxBarSize={18} />
          <Bar dataKey='failed' stackId='a' fill={COLORS.failed} radius={[10, 10, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
