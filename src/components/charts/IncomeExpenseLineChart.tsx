import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendData {
  date: string;
  income: number;
  expense: number;
}

interface IncomeExpenseLineChartProps {
  data: TrendData[];
}

const IncomeExpenseLineChart: React.FC<IncomeExpenseLineChartProps> = ({ data }) => {
  return (
    <Card className="rounded-xl shadow-lg border-none h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Tren Pendapatan vs Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] pl-2">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="date" className="text-xs text-gray-600 dark:text-gray-400" />
              <YAxis tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} className="text-xs text-gray-600 dark:text-gray-400" />
              <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" activeDot={{ r: 8 }} name="Pendapatan" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" activeDot={{ r: 8 }} name="Pengeluaran" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Tidak ada data tren untuk ditampilkan.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseLineChart;