import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface ExpenseByCategoryChartProps {
  data: CategoryData[];
  totalExpense: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Example colors

const ExpenseByCategoryChart: React.FC<ExpenseByCategoryChartProps> = ({ data, totalExpense }) => {
  return (
    <Card className="rounded-xl shadow-lg border-none h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pengeluaran per Kategori</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string, props: any) => [`Rp ${value.toLocaleString('id-ID')}`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-center">
            Tidak ada data pengeluaran untuk ditampilkan.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseByCategoryChart;