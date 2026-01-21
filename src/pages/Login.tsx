import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppLogo from '@/components/AppLogo';
import LoginHero from '@/components/LoginHero';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// Define schema for login form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    const { email, password } = data;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("password", { message: error.message });
      toast.error("Gagal masuk", { description: error.message });
    } else {
      toast.success("Berhasil masuk!", { description: "Anda akan diarahkan ke dashboard." });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-emerald-green to-teal-blue">
      {/* Left Side - Hero Section (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 p-8">
        <LoginHero />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center p-4 lg:p-8 relative">
        {/* Mobile background blur */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-emerald-green to-teal-blue opacity-70 backdrop-blur-md"></div>
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6 relative z-10 animate-fade-in">
          <div className="flex justify-center mb-6">
            <AppLogo className="animate-fade-in" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Masuk ke Akun Anda
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email Anda"
                  className={cn("pl-10 pr-4 py-2 rounded-xl focus:border-myfinance-primary-light focus:ring-1 focus:ring-myfinance-primary-light transition-all", errors.email && "border-red-500")}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi Anda"
                  className={cn("pl-10 pr-10 py-2 rounded-xl focus:border-myfinance-primary-light focus:ring-1 focus:ring-myfinance-primary-light transition-all", errors.password && "border-red-500")}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" className="rounded-md border-gray-300 text-myfinance-primary-light focus:ring-myfinance-primary-light" {...register("rememberMe")} />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400">Ingat Saya</Label>
              </div>
              <Link to="/forgot-password" className="text-sm text-myfinance-primary-light hover:underline">
                Lupa Password?
              </Link>
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
                  Memuat...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
              atau
            </span>
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-200 dark:bg-gray-700" />
          </div>

          <Link to="/register">
            <Button variant="outline" className="w-full py-3 rounded-xl border-2 border-myfinance-primary-light text-myfinance-primary-light font-semibold text-lg hover:bg-myfinance-primary-light hover:text-white transition-all duration-300 shadow-md">
              Daftar Akun Baru
            </Button>
          </Link>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <p>Akun Demo: <span className="font-semibold text-myfinance-primary-light">demo@myfinance.com</span> / <span className="font-semibold text-myfinance-primary-light">demo123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;