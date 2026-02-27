'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { RoleUsage } from '@/lib/api';

type Props = {
  data?: RoleUsage[];
};

const COLORS = ['#0B2D68', '#6AD2FF', '#E9F1FD'];

const FALLBACK: RoleUsage[] = [
  { name: 'Riders', value: 63 },
  { name: 'Drivers', value: 25 },
  { name: 'Other', value: 12 },
];

export default function PieChartComponent({ data }: Props) {
  const chartData = data && data.length ? data : FALLBACK;
  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <ChartContainer
      config={{
        Riders: { label: 'Riders' },
        Drivers: { label: 'Drivers' },
        Other: { label: 'Other' },
      }}
      className='w-full h-full'
    >
      <div className='flex flex-col items-center justify-center h-full'>
        <ResponsiveContainer width='100%' height='65%'>
          <PieChart>
            <Pie
              data={chartData}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='50%'
              innerRadius={42}
              outerRadius={68}
              label={false}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Custom Legend */}
        <div className='flex justify-center gap-6 mt-2'>
          {chartData.map((entry, index) => {
            const percentage = ((entry.value / total) * 100).toFixed(0);
            return (
              <div key={entry.name} className='flex flex-col items-center text-center'>
                <div className='w-2 h-2 rounded-full mb-1' style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className='text-gray-600 text-[10px] font-medium'>{entry.name}</span>
                <span className='text-[#062F71] text-xs font-bold'>{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </ChartContainer>
  );
}
