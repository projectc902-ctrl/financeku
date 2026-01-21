import React, { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Wallet, TrendingUp, TrendingDown, Utensils, Car, ShoppingBag, Receipt, Smile, Heart, GraduationCap, Briefcase, Gift, PiggyBank, MoreHorizontal, Check } from 'lucide-react'; // Added Check icon
import { cn } from '@/lib/utils';

// Schema for category form validation
const categorySchema = z.object({
  name: z.string().min(1, { message: "Nama kategori tidak boleh kosong." }).max(50, { message: "Nama kategori maksimal 50 karakter." }),
  type: z.enum(['income', 'expense'], { message: "Jenis kategori harus dipilih." }),
  color: z.string().min(1, { message: "Warna kategori harus dipilih." }),
});

type CategoryFormInputs = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string; // Storing icon name as string for now
}

const defaultCategoryIcons: Record<string, React.ReactNode> = {
  'Utensils': <Utensils className="h-5 w-5" />,
  'Car': <Car className="h-5 w-5" />,
  'ShoppingBag': <ShoppingBag className="h-5 w-5" />,
  'Receipt': <Receipt className="h-5 w-5" />,
  'Smile': <Smile className="h-5 w-5" />,
  'Heart': <Heart className="h-5 w-5" />,
  'GraduationCap': <GraduationCap className="h-5 w-5" />,
  'Briefcase': <Briefcase className="h-5 w-5" />,
  'Gift': <Gift className="h-5 w-5" />,
  'PiggyBank': <PiggyBank className="h-5 w-5" />,
  'Wallet': <Wallet className="h-5 w-5" />,
  'TrendingUp': <TrendingUp className="h-5 w-5" />,
  'TrendingDown': <TrendingDown className="h-5 w-5" />,
  'MoreHorizontal': <MoreHorizontal className="h-5 w-5" />,
};

const categoryColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#A1C4FD', '#FFD700', '#ADFF2F',
  '#FF4500', '#8A2BE2', '#00CED1', '#FF1493', '#7FFF00', '#DC143C', '#00BFFF', '#FFDAB9', '#800080', '#6A5ACD'
];

const Categories = () => {
  const { session, supabase } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInputs>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      color: categoryColors[0],
    },
  });

  const watchedType = watch('type');
  const watchedColor = watch('color');

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    fetchCategories();
  }, [session, navigate]);

  const fetchCategories = async () => {
    if (!session) return;
    setLoading(true);
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
    setLoading(false);
  };

  const onSubmit = async (data: CategoryFormInputs) => {
    setLoading(true);
    if (!session?.user?.id) {
      toast.error("Autentikasi gagal", { description: "Pengguna tidak terautentikasi." });
      setLoading(false);
      return;
    }

    if (editingCategory) {
      // Update existing category
      const { error } = await supabase
        .from('categories')
        .update({ name: data.name, type: data.type, color: data.color })
        .eq('id', editingCategory.id)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error updating category:', error);
        toast.error("Gagal memperbarui kategori", { description: error.message });
      } else {
        toast.success("Kategori berhasil diperbarui!");
        setIsDialogOpen(false);
        fetchCategories();
      }
    } else {
      // Add new category
      const { error } = await supabase
        .from('categories')
        .insert({ user_id: session.user.id, name: data.name, type: data.type, color: data.color });

      if (error) {
        console.error('Error adding category:', error);
        toast.error("Gagal menambahkan kategori", { description: error.message });
      } else {
        toast.success("Kategori berhasil ditambahkan!");
        setIsDialogOpen(false);
        fetchCategories();
      }
    }
    setLoading(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      type: category.type,
      color: category.color,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!session?.user?.id) {
      toast.error("Autentikasi gagal", { description: "Pengguna tidak terautentikasi." });
      return;
    }

    // Check for associated transactions
    const { count: transactionCount, error: transactionError } = await supabase
      .from('transactions')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryId)
      .eq('user_id', session.user.id);

    if (transactionError) {
      console.error('Error checking transactions:', transactionError);
      toast.error("Gagal memeriksa transaksi terkait", { description: transactionError.message });
      return;
    }

    if (transactionCount && transactionCount > 0) {
      toast.error("Tidak dapat menghapus kategori", {
        description: `Ada ${transactionCount} transaksi yang menggunakan kategori ini. Harap pindahkan atau hapus transaksi tersebut terlebih dahulu.`,
      });
      return;
    }

    if (window.confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting category:', error);
        toast.error("Gagal menghapus kategori", { description: error.message });
      } else {
        toast.success("Kategori berhasil dihapus!");
        fetchCategories();
      }
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({
        name: category.name,
        type: category.type,
        color: category.color,
      });
    } else {
      setEditingCategory(null);
      reset({
        name: '',
        type: 'expense',
        color: categoryColors[0],
      });
    }
    setIsDialogOpen(true);
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Manajemen Kategori</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-emerald-green to-teal-blue hover:from-emerald-green/90 hover:to-teal-blue/90 text-white rounded-xl shadow-md">
          <Plus className="h-4 w-4 mr-2" /> Tambah Kategori
        </Button>
      </div>

      <Tabs defaultValue="expense" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gray-100 dark:bg-gray-700">
          <TabsTrigger value="expense" className="rounded-xl data-[state=active]:bg-myfinance-expense data-[state=active]:text-white">
            Pengeluaran ({expenseCategories.length})
          </TabsTrigger>
          <TabsTrigger value="income" className="rounded-xl data-[state=active]:bg-myfinance-income data-[state=active]:text-white">
            Pendapatan ({incomeCategories.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="expense" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-xl shadow-lg border-none animate-pulse">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : expenseCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenseCategories.map(category => (
                <Card key={category.id} className="rounded-xl shadow-lg border-none hover:shadow-xl transition-shadow duration-200">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full text-white" style={{ backgroundColor: category.color }}>
                        {defaultCategoryIcons[category.icon || 'MoreHorizontal']}
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">{category.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pengeluaran</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              Tidak ada kategori pengeluaran. Tambahkan yang baru!
            </div>
          )}
        </TabsContent>
        <TabsContent value="income" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="rounded-xl shadow-lg border-none animate-pulse">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : incomeCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomeCategories.map(category => (
                <Card key={category.id} className="rounded-xl shadow-lg border-none hover:shadow-xl transition-shadow duration-200">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full text-white" style={{ backgroundColor: category.color }}>
                        {defaultCategoryIcons[category.icon || 'MoreHorizontal']}
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">{category.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pendapatan</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              Tidak ada kategori pendapatan. Tambahkan yang baru!
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
            <div>
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                placeholder="Contoh: Makanan, Gaji"
                className={cn("mt-1 rounded-xl focus:border-myfinance-primary-light focus:ring-1 focus:ring-myfinance-primary-light transition-all", errors.name && "border-red-500")}
                {...register("name")}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="type">Jenis Kategori</Label>
              <Select onValueChange={(value: 'income' | 'expense') => setValue('type', value)} value={watchedType}>
                <SelectTrigger className={cn("w-full mt-1 rounded-xl focus:border-myfinance-primary-light focus:ring-1 focus:ring-myfinance-primary-light transition-all", errors.type && "border-red-500")}>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="income">Pendapatan</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.type.message}</p>}
            </div>

            <div>
              <Label htmlFor="color">Warna Kategori</Label>
              <div className="grid grid-cols-6 gap-2 mt-1">
                {categoryColors.map((colorOption) => (
                  <div
                    key={colorOption}
                    className={cn(
                      "w-8 h-8 rounded-full cursor-pointer border-2 transition-all duration-150",
                      watchedColor === colorOption ? 'border-myfinance-primary-light scale-110' : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: colorOption }}
                    onClick={() => setValue('color', colorOption)}
                  >
                    {watchedColor === colorOption && (
                      <Check className="h-full w-full text-white p-1" />
                    )}
                  </div>
                ))}
              </div>
              {errors.color && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.color.message}</p>}
            </div>

            {/* Icon Picker (Placeholder for now, can be implemented later) */}
            {/* <div>
              <Label htmlFor="icon">Ikon Kategori</Label>
              <div className="grid grid-cols-6 gap-2 mt-1">
                {Object.keys(defaultCategoryIcons).map((iconName) => (
                  <div
                    key={iconName}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all duration-150",
                      watchedIcon === iconName ? 'border-myfinance-primary-light bg-gray-100 dark:bg-gray-700 scale-110' : 'border-transparent hover:scale-105 bg-gray-50 dark:bg-gray-800'
                    )}
                    onClick={() => setValue('icon', iconName)}
                  >
                    {defaultCategoryIcons[iconName]}
                    {watchedIcon === iconName && (
                      <Check className="absolute h-4 w-4 text-myfinance-primary-light" />
                    )}
                  </div>
                ))}
              </div>
            </div> */}

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-green to-teal-blue hover:from-emerald-green/90 hover:to-teal-blue/90 text-white rounded-xl shadow-md"
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
                  editingCategory ? 'Perbarui Kategori' : 'Tambah Kategori'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;