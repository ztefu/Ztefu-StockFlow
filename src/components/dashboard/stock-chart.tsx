"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StockChartProps {
  data: any[];
}

export function StockChart({ data }: StockChartProps) {
  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[400px] hover:shadow-md hover:-translate-y-1 active:shadow-md active:-translate-y-1 transition-all duration-200">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 shrink-0">Évolution des Mouvements</h3>
      <div className="flex-1 w-full overflow-x-auto overflow-y-hidden">
        <div className="min-w-[500px] h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
              <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="entries" name="Entrées" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorEntries)" />
              <Area type="monotone" dataKey="exits" name="Sorties" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorExits)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
