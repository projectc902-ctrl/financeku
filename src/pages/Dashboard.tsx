import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet, CalendarDays, Plus, Eye, Settings } from 'lucide-react';
import ExpenseByCategoryChart from '@/components/charts/ExpenseByCategoryChart';
import IncomeExpenseLineChart from '@/components/charts/IncomeExpenseLineChart';
import QuickActionsFAB from '@/components/QuickActionsFAB';
import { CustomProgress } from '@/components/CustomProgress';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isSameMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/currency';
import { toast } from 'sonner'; // Import toast from sonner

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
  type: 'income' | 'expense';
  amount: number;
  category_id: string;
  transaction_date: string;
  notes?: string;
  created_at: string;
  categories: {
    name: string;
    type: 'income' | 'expense';
    color: string;
  } | null;
}

interface AppCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

const Dashboard = () => {
  const { session, supabase } = useSession();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Pengguna');
  const [loadingData, setLoadingData] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // State for financial summaries
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0); // Placeholder for now
  const [budgetTarget, setBudgetTarget] = useState(0); // Placeholder for now
  const [budgetProgress, setBudgetProgress] = useState(0); // Placeholder for now

  // State for charts and lists
  const [expenseByCategoryData, setExpenseByCategoryData] = useState<CategoryData[]>([]);
  const [incomeExpenseTrendData, setIncomeExpenseTrendData] = useState<TrendData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [allCategories, setAllCategories] = useState<AppCategory[]>([]);

  const currentDateFormatted = format(new Date(), "EEEE, dd MMMM yyyy", { locale: id });
  const currentMonthYearFormatted = format(currentMonth, "MMMM yyyy", { locale: id });

  const fetchDashboardData = useCallback(async () => {
    if (!session?.user?.id) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setUserName(profileData.first_name || 'Pengguna');
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', session.user.id);

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        setAllCategories(categoriesData as AppCategory[]);
      }

      // Fetch all transactions for calculations
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*, categories(name, type, color)')
        .eq('user_id', session.user.id)
        .order('transaction_date', { ascending: false });

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        return;
      }

      const transactions: Transaction[] = transactionsData || [];

      // Calculate total balance
      let balance = 0;
      transactions.forEach(t => {
        if (t.type === 'income') {
          balance += t.amount;
        } else {
          balance -= t.amount;
        }
      });
      setTotalBalance(balance);

      // Filter transactions for the current month
      const startOfCurrentMonth = startOfMonth(currentMonth);
      const endOfCurrentMonth = endOfMonth(currentMonth);

      const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth;
      });

      let incomeThisMonth = 0;
      let expenseThisMonth = 0;
      const expenseByCategoryMap = new Map<string, number>();

      monthlyTransactions.forEach(t => {
        if (t.type === 'income') {
          incomeThisMonth += t.amount;
        } else {
          expenseThisMonth += t.amount;
          const categoryName = t.categories?.name || 'Uncategorized';
          expenseByCategoryMap.set(categoryName, (expenseByCategoryMap.get(categoryName) || 0) + t.amount);
        }
      });
      setMonthlyIncome(incomeThisMonth);
      setMonthlyExpense(expenseThisMonth);

      // Populate expense by category data
      const processedExpenseByCategoryData: CategoryData[] = Array.from(expenseByCategoryMap.entries()).map(([name, value]) => {
        const category = allCategories.find(cat => cat.name === name && cat.type === 'expense');
        return {
          name,
          value,
          color: category?.color || '#ccc', // Default color if not found
        };
      });
      setExpenseByCategoryData(processedExpenseByCategoryData);

      // Populate income/expense trend data (last 6 months)
      const trendDataMap = new Map<string, { income: number; expense: number }>();
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(new Date(), i);
        trendDataMap.set(format(month, 'MMM', { locale: id }), { income: 0, expense: 0 });
      }

      transactions.forEach(t => {
        const transactionMonth = format(new Date(t.transaction_date), 'MMM', { locale: id });
        if (trendDataMap.has(transactionMonth)) {
          const currentMonthData = trendDataMap.get(transactionMonth)!;
          if (t.type === 'income') {
            currentMonthData.income += t.amount;
          } else {
            currentMonthData.expense += t.amount;
          }
          trendDataMap.set(transactionMonth, currentMonthData);
        }
      });
      setIncomeExpenseTrendData(Array.from(trendDataMap.entries()).map(([date, values]) => ({ date, ...values })));

      // Populate recent transactions (last 5)
      setRecentTransactions(transactions.slice(0, 5));

      // Placeholder for budget (will be implemented with a budgets table)
      const placeholderBudgetTarget = 8000000; // Example target
      setBudgetTarget(placeholderBudgetTarget);
      setRemainingBudget(placeholderBudgetTarget - expenseThisMonth);
      setBudgetProgress((expenseThisMonth / placeholderBudgetTarget) * 100);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error("Gagal memuat data dashboard", { description: "Terjadi kesalahan saat mengambil data." });
    } finally {
      setLoadingData(false);
    }
  }, [session, supabase, currentMonth, allCategories]); // Added allCategories to dependencies

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [session, navigate, fetchDashboardData]);

  if (!session || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">Memuat data dashboard...</p>
      </div>
    );
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = allCategories.find(cat => cat.id === categoryId);
    // For now, we'll use generic icons based on type or a default
    if (category?.type === 'income') return <TrendingUp className="h-4 w-4" />;
    if (category?.type === 'expense') return <TrendingDown className="h-4 w-4" />;
    return <DollarSign className="h-4 w-4" />;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = allCategories.find(cat => cat.id === categoryId);
    return category?.color || 'bg-gray-200 dark:bg-gray-700';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-gradient-to-r from-emerald-green to-teal-blue rounded-2xl shadow-lg text-white">
        <div>
          <h1 className="text-3xl font-bold animate-fade-in">Selamat Datang, {userName}!</h1>
          <p className="text-sm flex items-center gap-2 mt-1 opacity-0 animate-slide-down" style={{ animationDelay: '200ms' }}>
            <CalendarDays className="h-4 w-4" /> {currentDateFormatted}
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
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-blue-200">Per {currentDateFormatted}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg border-none bg-gradient-to-br from-emerald-green to-green-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Pendapatan Bulan Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-200 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div>
            <p className="text-xs text-green-200">Bulan {currentMonthYearFormatted}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg border-none bg-gradient-to-br from-red-500 to-red-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Pengeluaran Bulan Ini</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-200 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyExpense)}</div>
            <p className="text-xs text-red-200">Bulan {currentMonthYearFormatted}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg border-none bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Sisa Anggaran</CardTitle>
            <Wallet className="h-4 w-4 text-purple-200 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(remainingBudget)}</div>
            <p className="text-xs text-purple-200">Target: {formatCurrency(budgetTarget)}</p>
            <CustomProgress value={budgetProgress} className="h-2 mt-2" indicatorColor={
              budgetProgress < 50 ? "bg-green-400" : budgetProgress < 80 ? "bg-yellow-400" : "bg-red-400"
            } />
          </CardContent>
        </Card>
      </div>

      {/* Section Grafik & Visualisasi */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-[400px]">
        <div className="col-span-4 h-full">
          <ExpenseByCategoryChart data={expenseByCategoryData} totalExpense={monthlyExpense} />
        </div>
        <Card className="col-span-3 rounded-xl shadow-lg border-none h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Top Kategori Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseByCategoryData.sort((a, b) => b.value - a.value).slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 rounded-full text-white" style={{ backgroundColor: item.color }}>
                  <DollarSign className="h-4 w-4" /> {/* Generic icon for now */}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                  <CustomProgress value={(item.value / monthlyExpense) * 100} className="h-2 mt-1" indicatorColor={item.color} />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(item.value)}</span>
              </div>
            ))}
            {expenseByCategoryData.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                Tidak ada data pengeluaran untuk ditampilkan.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section Grafik Baris Kedua */}
      <div className="grid gap-4 h-[400px]">
        <div className="col-span-1 h-full">
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
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-full", transaction.type === 'income' ? 'bg-myfinance-income/20 text-myfinance-income' : 'bg-myfinance-expense/20 text-myfinance-expense')}>
                    {getCategoryIcon(transaction.category_id)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{transaction.categories?.name || 'Uncategorized'}</p>
                    {transaction.notes && <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.notes}</p>}
                    <p className="text-xs text-gray-400 dark:text-gray-500">{format(new Date(transaction.transaction_date), 'dd MMM, HH:mm', { locale: id })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold text-lg",
                    transaction.type === 'income' ? 'text-myfinance-income' : 'text-myfinance-expense'
                  )}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              Tidak ada transaksi terbaru untuk ditampilkan.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions FAB */}
      <QuickActionsFAB />
    </div>
  );
};

export default Dashboard;