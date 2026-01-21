import React from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react'; // Added Wallet import

const Dashboard = () => {
  const { session, supabase } = useSession();
  const navigate = useNavigate();

  // Placeholder data for now
  const totalBalance = 15000000; // Rp 15.000.000
  const monthlyIncome = 10000000; // Rp 10.000.000
  const monthlyExpense = 5000000; // Rp 5.000.000
  const remainingBudget = 3000000; // Rp 3.000.000

  if (!session) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard Keuangan</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl shadow-lg border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Rp {totalBalance.toLocaleString('id-ID')}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">+20.1% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendapatan Bulan Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Rp {monthlyIncome.toLocaleString('id-ID')}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">+10% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pengeluaran Bulan Ini</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">Rp {monthlyExpense.toLocaleString('id-ID')}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">-5% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Sisa Anggaran</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Rp {remainingBudget.toLocaleString('id-ID')}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Target: Rp 8.000.000</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for charts and other sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-xl shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Visualisasi Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Chart will go here */}
            <div className="h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              Grafik pengeluaran akan ditampilkan di sini
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 rounded-xl shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Perbandingan Pendapatan vs Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Chart will go here */}
            <div className="h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              Grafik perbandingan akan ditampilkan di sini
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;