import React, { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // Corrected import path
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, DollarSign, Tag, NotebookPen, Plus, Edit, Trash2, Search, Filter, ArrowUpWideNarrow, ArrowDownWideNarrow, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, parseCurrency } from '@/utils/currency';

// Schema for transaction form validation
const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { message: "Jenis transaksi harus dipilih." }),
  amount: z.string().refine(val => parseCurrency(val) > 0, { message: "Jumlah harus lebih besar dari 0." }),
  category: z.string().min(1, { message: "Kategori harus dipilih." }),
  transactionDate: z.date({ required_error: "Tanggal transaksi harus dipilih." }),
  notes: z.string().max(200, { message: "Catatan maksimal 200 karakter." }).optional(),
});

type TransactionFormInputs = z.infer<typeof transactionSchema>;

// Placeholder for Category and Transaction types
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string; // Optional color for categories
  icon?: React.ReactNode; // Optional icon for categories
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  categoryId: string;
  transactionDate: Date;
  notes?: string;
  createdAt: Date;
}

const Transactions = () => {
  const { session, supabase } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // Default latest first

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormInputs>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      category: '',
      transactionDate: new Date(),
      notes: '',
    },
  });

  const watchedAmount = watch('amount');
  const watchedNotes = watch('notes');
  const watchedTransactionDate = watch('transactionDate');

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    // Set initial transaction type from URL if available
    const urlParams = new URLSearchParams(location.search);
    const typeParam = urlParams.get('type');
    if (typeParam === 'income' || typeParam === 'expense') {
      setTransactionType(typeParam);
      setValue('type', typeParam);
    }

    fetchCategories();
    fetchTransactions();
  }, [session, navigate, location.search]);

  useEffect(() => {
    setValue('type', transactionType);
  }, [transactionType, setValue]);

  const fetchCategories = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', session.user?.id);

    if (error) {
      console.error('Error fetching categories:', error);
      toast.error("Gagal memuat kategori", { description: error.message });
    } else {
      setCategories(data as Category[]);
    }
  };

  const fetchTransactions = async () => {
    if (!session) return;
    setLoading(true);
    let query = supabase
      .from('transactions')
      .select('*, categories(name, type, color)') // Select category details
      .eq('user_id', session.user?.id);

    if (filterType !== 'all') {
      query = query.eq('type', filterType);
    }
    if (filterCategory !== 'all') {
      query = query.eq('category_id', filterCategory);
    }
    if (filterDateRange.from) {
      query = query.gte('transaction_date', format(filterDateRange.from, 'yyyy-MM-dd'));
    }
    if (filterDateRange.to) {
      query = query.lte('transaction_date', format(filterDateRange.to, 'yyyy-MM-dd'));
    }

    query = query.order('transaction_date', { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      toast.error("Gagal memuat transaksi", { description: error.message });
    } else {
      const formattedTransactions: Transaction[] = data.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        category: t.categories?.name || 'Uncategorized', // Use category name
        categoryId: t.category_id,
        transactionDate: new Date(t.transaction_date),
        notes: t.notes,
        createdAt: new Date(t.created_at),
      }));
      setTransactions(formattedTransactions);
    }
    setLoading(false);
  };

  const onSubmit = async (data: TransactionFormInputs) => {
    setLoading(true);
    const parsedAmount = parseCurrency(data.amount);

    const { error } = await supabase.auth.getUser(); // Ensure user is authenticated

    if (error) {
      toast.error("Autentikasi gagal", { description: error.message });
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: session?.user?.id,
        type: data.type,
        amount: parsedAmount,
        category_id: data.category,
        transaction_date: format(data.transactionDate, 'yyyy-MM-dd'),
        notes: data.notes,
      });

    if (insertError) {
      console.error('Error adding transaction:', insertError);
      toast.error("Gagal menambahkan transaksi", { description: insertError.message });
    } else {
      toast.success("Transaksi berhasil ditambahkan!");
      reset({
        type: transactionType, // Keep current type
        amount: '',
        category: '',
        transactionDate: new Date(),
        notes: '',
      });
      fetchTransactions(); // Refresh transaction list
    }
    setLoading(false);
  };

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const dateKey = format(transaction.transactionDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    if (sortOrder === 'desc') {
      return new Date(b).getTime() - new Date(a).getTime();
    }
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const parsed = parseCurrency(rawValue);
    setValue('amount', parsed === 0 ? '' : formatCurrency(parsed).replace('Rp ', ''));
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || 'bg-gray-200 dark:bg-gray-700'; // Default color
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-full">
      {/* Left Side - Transaction Input Form */}
      <Card className="lg:w-2/5 xl:w-1/3 rounded-2xl shadow-lg border-none sticky top-6 h-fit">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {transactionType === 'income' ? 'Tambah Pendapatan' : 'Tambah Pengeluaran'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Type Toggle */}
            <div>
              <Label className="mb-2 block">Jenis Transaksi</Label>
              <ToggleGroup
                type="single"
                value={transactionType}
                onValueChange={(value: 'income' | 'expense') => {
                  if (value) {
                    setTransactionType(value);
                    setValue('type', value);
                  }
                }}
                className="grid grid-cols-2 w-full rounded-xl overflow-hidden"
              >
                <ToggleGroupItem
                  value="income"
                  aria-label="Toggle income"
                  className={cn(
                    "py-3 rounded-xl data-[state=on]:bg-myfinance-income data-[state=on]:text-white transition-all",
                    transactionType === 'income' ? 'bg-myfinance-income text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  <TrendingUp className="h-4 w-4 mr-2" /> Pendapatan
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="expense"
                  aria-label="Toggle expense"
                  className={cn(
                    "py-3 rounded-xl data-[state=on]:bg-myfinance-expense data-[state=on]:text-white transition-all",
                    transactionType === 'expense' ? 'bg-myfinance-expense text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  <TrendingDown className="h-4 w-4 mr-2" /> Pengeluaran
                </ToggleGroupItem>
              </ToggleGroup>
              {errors.type && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.type.message}</p>}
            </div>

            {/* Amount Input */}
            <div>
              <Label htmlFor="amount">Jumlah Uang</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">Rp</span>
                <Input
                  id="amount"
                  type="text"
                  placeholder="0"
                  className={cn(
                    "pl-10 pr-4 py-3 text-2xl font-bold rounded-xl focus:border-myfinance-primary-light focus:ring-1 focus:ring-myfinance-primary-light transition-all",
                    transactionType === 'income' ? 'bg-green-50/50 border-green-200 text-myfinance-income' : 'bg-red-50/50 border-red-200 text-myfinance-expense',
                    errors.amount && "border-red-500"
                  )}
                  {...register("amount", { onChange: handleAmountChange })}
                  value={watchedAmount}
                />
              </div>
              {errors.amount && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.amount.message}</p>}
            </div>

            {/* Category Dropdown */}
            <div>
              <Label htmlFor="category">Kategori</Label>
              <div className="relative mt-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select onValueChange={(value) => setValue('category', value)} value={watch('category')}>
                  <SelectTrigger className={cn("w-full pl-10 pr-4 py-2 rounded-xl focus:border-myfinance-primary-light focus:ring-1 focus:ring-myfinance-primary-light transition-all", errors.category && "border-red-500")}>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.filter(cat => cat.type === transactionType).map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#ccc' }}></span>
                        {cat.name}
                      </SelectItem>
                    ))}
                    {/* Quick add category button */}
                    <div className="p-2 border-t mt-2">
                      <Button variant="ghost" className="w-full justify-start text-myfinance-primary-light">
                        <Plus className="h-4 w-4 mr-2" /> Tambah Kategori Baru
                      </Button>
                    </div>
                  </SelectContent>
                </Select>
              </div>
              {errors.category && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.category.message}</p>}
            </div>

            {/* Date Picker */}
            <div>
              <Label htmlFor="transactionDate">Tanggal Transaksi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal pl-10 pr-4 py-2 rounded-xl mt-1",
                      !watchedTransactionDate && "text-muted-foreground",
                      errors.transactionDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {watchedTransactionDate ? format(watchedTransactionDate, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl">
                  <Calendar
                    mode="single"
                    selected={watchedTransactionDate}
                    onSelect={(date) => date && setValue('transactionDate', date)}
                    initialFocus
                    locale={id}
                    captionLayout="dropdown-buttons"
                    fromYear={2000}
                    toYear={new Date().getFullYear() + 1}
                  />
                </PopoverContent>
              </Popover>
              {errors.transactionDate && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.transactionDate.message}</p>}
            </div>

            {/* Notes Textarea */}
            <div>
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <div className="relative mt-1">
                <NotebookPen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="notes"
                  placeholder="Tambahkan catatan untuk transaksi ini..."
                  className={cn("pl-10 pr-4 py-2 rounded-xl min-h-[80px] focus:border-myfinance-primary-light focus:ring-1 focus:ring-myfinance-primary-light transition-all", errors.notes && "border-red-500")}
                  {...register("notes")}
                />
                <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                  {watchedNotes?.length || 0}/200
                </span>
              </div>
              {errors.notes && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.notes.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-emerald-green to-teal-blue hover:from-emerald-green/90 hover:to-teal-blue/90 transition-all duration-300 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                "Simpan Transaksi"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Right Side - Transaction List */}
      <div className="flex-1 space-y-6">
        <Card className="rounded-2xl shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Cari transaksi..." className="pl-10 rounded-xl" />
              </div>
              <Select onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)} value={filterType}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Jenis" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="income">Pendapatan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setFilterCategory(value)} value={filterCategory}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <Tag className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color || '#ccc' }}></span>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="rounded-xl" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
                {sortOrder === 'desc' ? <ArrowDownWideNarrow className="h-4 w-4 mr-2" /> : <ArrowUpWideNarrow className="h-4 w-4 mr-2" />}
                Urutkan
              </Button>
            </div>

            {/* Transaction List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.length > 0 ? (
                  sortedDates.map(dateKey => (
                    <div key={dateKey}>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10">
                        {format(new Date(dateKey), 'EEEE, dd MMMM yyyy', { locale: id })}
                      </h3>
                      <div className="space-y-3">
                        {groupedTransactions[dateKey].map(transaction => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-full", transaction.type === 'income' ? 'bg-myfinance-income/20 text-myfinance-income' : 'bg-myfinance-expense/20 text-myfinance-expense')}>
                                {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{transaction.category}</p>
                                {transaction.notes && <p className="text-sm text-gray-500 dark:text-gray-400 italic">{transaction.notes}</p>}
                                <p className="text-xs text-gray-400 dark:text-gray-500">{format(transaction.createdAt, 'HH:mm', { locale: id })}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "font-semibold text-lg",
                                transaction.type === 'income' ? 'text-myfinance-income' : 'text-myfinance-expense'
                              )}>
                                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                              </span>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                    Tidak ada transaksi untuk ditampilkan.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;