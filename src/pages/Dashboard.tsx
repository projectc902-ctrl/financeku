import React, { useEffect, useState } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet, CalendarDays, Plus, Eye, Settings } from 'lucide-react';
import ExpenseByCategoryChart from '@/components/charts/ExpenseByCategoryChart';
import IncomeExpenseLineChart from '@/components/charts/IncomeExpenseLineChart';
import QuickActionsFAB from '@/components/QuickActionsFAB';
import { CustomProgress } from '@/components/CustomProgress'; // Import CustomProgress
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale'; // Import Indonesian locale
import { cn } from '@/lib/utils'; // Import cn utility

// Placeholder data types
interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface TrendData {
  date: string;
  income: number;
  expense: number;
}

interface Transaction {
  id: string;
  category: string;
  categoryIcon: React.ReactNode;
  categoryColor: string;
  notes: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
}

const Dashboard = () => {
  const { session, supabase } = useSession();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Pengguna');
  const currentDate = format(new Date(), "EEEE, dd MMMM yyyy", { locale: id });

  // Placeholder data for now
  const totalBalance = 15000000; // Rp 15.000.000
  const monthlyIncome = 10000000; // Rp 10.000.000
  const monthlyExpense = 5000000; // Rp 5.000.000
  const remainingBudget = 3000000; // Rp 3.000.000
  const budgetTarget = 8000000; // Rp 8.000.000
  const budgetProgress = (monthlyExpense / budgetTarget) * 100;

  const expenseByCategoryData: CategoryData[] = [
    { name: 'Makanan & Minuman', value: 2000000, color: '#FF6384' },
    { name: 'Transportasi', value: 1000000, color: '#36A2EB' },
    { name: 'Belanja', value: 1500000, color: '#FFCE56' },
    { name: 'Hiburan', value: 500000, color: '#4BC0C0' },
  ];
  const totalMonthlyExpense = expenseByCategoryData.reduce((sum, item) => sum + item.value, 0);

  const incomeExpenseTrendData: TrendData[] = [
    { date: 'Jan', income: 8000000, expense: 4000000 },
    { date: 'Feb', income: 9000000, expense: 4500000 },
    { date: 'Mar', income: 10000000, expense: 5000000 },
    { date: 'Apr', income: 9500000, expense: 5200000 },
    { date: 'Mei', income: 11000000, expense: 5500000 },
    { date: 'Jun', income: 10000000, expense: 5000000 },
  ];

  const topExpenses = [
    { name: 'Makanan & Minuman', amount: 2000000, percentage: 40, icon: <DollarSign className="h-4 w-4" />, color: '#FF6384' },
    { name: 'Belanja', amount: 1500000, percentage: 30, icon: <DollarSign className="h-4 w-4" />, color: '#FFCE56' },
    { name: 'Transportasi', amount: 1000000, percentage: 20, icon: <DollarSign className="h-4 w-4" />, color: '#36A2EB' },
    { name: 'Hiburan', amount: 500000, percentage: 10, icon: <DollarSign className="h-4 w-4" />, color: '#4BC0C0' },
  ];

  const recentTransactions: Transaction[] = [
    { id: '1', category: 'Gaji', categoryIcon: <DollarSign className="h-4 w-4" />, categoryColor: 'bg-myfinance-income', notes: 'Gaji bulanan', date: '2024-07-25T10:00:00Z', amount: 10000000, type: 'income' },
    { id: '2', category: 'Makanan', categoryIcon: <DollarSign className="h-4 w-4" />, categoryColor: 'bg-myfinance-expense', notes: 'Makan siang di kafe', date: '2024-07-24T14:30:00Z', amount: 75000, type: 'expense' },
    { id: '3', category: 'Transportasi', categoryIcon: <DollarSign className="h-4 w-4" />, categoryColor: 'bg-myfinance-expense', notes: 'Bensin mobil', date: '2024-07-24T08:00:00Z', amount: 150000, type: 'expense' },
    { id: '4', category: 'Belanja', categoryIcon: <DollarSign className="h-4 w-4" />, categoryColor: 'bg-myfinance-expense', notes: 'Baju baru', date: '2024-07-23T18:00:00Z', amount: 300000, type: 'expense' },
    { id: '5', category: 'Bonus', categoryIcon: <DollarSign className="h-4 w-4" />, categoryColor: 'bg-myfinance-income', notes: 'Bonus proyek', date: '2024-07-22T09:00:00Z', amount: 2000000, type: 'income' },
  ];

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', session.user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setUserName(data.first_name || 'Pengguna');
      }
    };

    fetchUserProfile();
  }, [session, navigate, supabase]);

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-gradient-to-r from-emerald-green to-teal-blue rounded-2xl shadow-lg text-white">
        <div>
          <h1 className="text-3xl font-bold animate-fade-in">Selamat Datang, {userName}!</h1>
          <p className="text-sm flex items-center gap-2 mt-1 opacity-0 animate-slide-down" style={{ animationDelay: '200ms' }}>
            <CalendarDays className="h-4 w-4" /> {currentDate}
          </p>
        </div>
        <div className="flex gap-3 opacity-0 animate-slide-down" style={{ animationDelay: '400ms' }}>
          <Link to="/transactions?action=new">
            <Button className="bg-white text-emerald-green hover:bg-gray-100 rounded-xl shadow-md">
              <Plus className="h-4 w-4 mr-2" /> Transaksi Baru
            </Button>
          </Link>
          <Link to="/reports">
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/20 rounded-xl shadow-md">
              <Eye className="h-4 w-4 mr-2" /> Lihat Laporan
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards Statistik */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl shadow-lg border-none bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-blue-200 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalBalance.toLocaleString('id-ID')}</div>
            <p className="text-xs text-blue-200">+20.1% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg border-none bg-gradient-to-br from-emerald-green to-green-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Pendapatan Bulan Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-200 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {monthlyIncome.toLocaleString('id-ID')}</div>
            <p className="text-xs text-green-200">+10% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg border-none bg-gradient-to-br from-red-500 to-red-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Pengeluaran Bulan Ini</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-200 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {monthlyExpense.toLocaleString('id-ID')}</div>
            <p className="text-xs text-red-200">-5% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg border-none bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Sisa Anggaran</CardTitle>
            <Wallet className="h-4 w-4 text-purple-200 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {remainingBudget.toLocaleString('id-ID')}</div>
            <p className="text-xs text-purple-200">Target: Rp {budgetTarget.toLocaleString('id-ID')}</p>
            <CustomProgress value={budgetProgress} className="h-2 mt-2" indicatorColor={
              budgetProgress < 50 ? "bg-green-400" : budgetProgress < 80 ? "bg-yellow-400" : "bg-red-400"
            } />
          </CardContent>
        </Card>
      </div>

      {/* Section Grafik & Visualisasi */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ExpenseByCategoryChart data={expenseByCategoryData} totalExpense={totalMonthlyExpense} />
        </div>
        <Card className="col-span-3 rounded-xl shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Top 5 Kategori Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topExpenses.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{ backgroundColor: item.color }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                  <CustomProgress value={item.percentage} className="h-2 mt-1" indicatorColor={item.color} />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rp {item.amount.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Section Grafik Baris Kedua */}
      <div className="grid gap-4">
        <div className="col-span-1">
          <IncomeExpenseLineChart data={incomeExpenseTrendData} />
        </div>
      </div>

      {/* Transaksi Terbaru Section */}
      <Card className="rounded-xl shadow-lg border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Transaksi Terbaru</CardTitle>
          <Link to="/transactions">
            <Button variant="link" className="text-myfinance-primary-light hover:underline">Lihat Semua</Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", transaction.categoryColor)}>
                  {transaction.categoryIcon}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{transaction.category}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.notes}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{format(new Date(transaction.date), 'dd MMM, HH:mm', { locale: id })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-semibold text-lg",
                  transaction.type === 'income' ? 'text-myfinance-income' : 'text-myfinance-expense'
                )}>
                  {transaction.type === 'income' ? '+' : '-'} Rp {transaction.amount.toLocaleString('id-ID')}
                </span>
                {/* Action buttons (edit, delete) can be added here */}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions FAB */}
      <QuickActionsFAB />
    </div>
  );
};

export default Dashboard;