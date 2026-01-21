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
import { Eye, EyeOff, User, Lock, Mail, Flag, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm, Controller } from 'react-hook-form'; // Import Controller
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

// Define schema for registration form validation
const registerSchema = z.object({
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  email: z.string().email({ message: "Email tidak valid." }),
  username: z.string().min(5, { message: "Username minimal 5 karakter." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  confirmPassword: z.string(),
  defaultCurrency: z.string().default("IDR"),
  termsAccepted: z.boolean().refine(val => val === true, { message: "Anda harus menyetujui syarat & ketentuan." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak cocok.",
  path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const Register = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-100

  const {
    register,
    handleSubmit,
    watch,
    control, // Get control from useForm
    formState: { errors },
    setError,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      termsAccepted: false, // Set a default boolean value
    }
  });

  const password = watch("password");

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 6) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[0-9!@#$%^&*]/.test(password)) strength += 25;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const getStrengthColor = (strength: number) => {
    if (strength < 50) return "bg-red-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength === 0) return "";
    if (strength < 50) return "Lemah";
    if (strength < 75) return "Sedang";
    return "Kuat";
  };

  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    const { email, password, fullName, username } = data;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    });

    if (error) {
      setError("email", { message: error.message }); // Generic error for now
      toast.error("Gagal mendaftar", { description: error.message });
    } else {
      toast.success("Pendaftaran berhasil!", { description: "Silakan cek email Anda untuk verifikasi." });
      navigate('/login'); // Redirect to login after successful registration
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-emerald-green to-teal-blue">
      {/* Left Side - Hero Section (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 p-8">
        <LoginHero />
      </div>

      {/* Right Side - Register Form */}
      <div className="flex flex-1 items-center justify-center p-4 lg:p-8 relative">
        {/* Mobile background blur */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-emerald-green to-teal-blue opacity-70 backdrop-blur-md"></div>
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6 relative z-10 animate-fade-in">
          <div className="flex justify-center mb-6">
            <AppLogo className="animate-fade-in" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Daftar Akun Baru
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  className={cn("pl-10 pr-4 py-2 rounded-xl focus:border-myfinance-primary-light focus:ring-1 focus:ring-myfinance-primary-light transition-all", errors.fullName && "border-red-500")}
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.fullName.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              <Label htmlFor="username">Username</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Buat username Anda"
                  className={cn("pl-10 pr-4 py-2 rounded-xl focus:border-myfinance-primary-light focus:ring-1 focus:ring-myfinance-primary-light transition-all", errors.username && "border-red-500")}
                  {...register("username")}
                />
              </div>
              {errors.username && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.username.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat kata sandi yang kuat"
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
              {password && (
                <div className="mt-2">
                  <Progress value={passwordStrength} className={cn("h-2", getStrengthColor(passwordStrength))} />
                  <span className={cn("text-xs mt-1 block", passwordStrength < 50 ? "text-red-500" : passwordStrength < 75 ? "text-yellow-500" : "text-green-500")}>
                    Kekuatan: {getStrengthText(passwordStrength)}
                  </span>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.password.message}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi kata sandi Anda"
                  className={cn("pl-10 pr-10 py-2 rounded-xl focus:border-myfinance-primary-light focus:ring-1 focus:ring-myfinance-primary-light transition-all", errors.confirmPassword && "border-red-500")}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <Label htmlFor="defaultCurrency">Mata Uang Default</Label>
              <Select onValueChange={(value) => {
                setError("defaultCurrency", { message: undefined }); // Clear error if user selects
                register("defaultCurrency").onChange({ target: { value } });
              }} defaultValue="IDR">
                <SelectTrigger className={cn("w-full pl-10 pr-4 py-2 rounded-xl focus:border-myfinance-primary-light focus:ring-1 focus:ring-myfinance-primary-light transition-all", errors.defaultCurrency && "border-red-500")}>
                  <Flag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Pilih mata uang" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="IDR">🇮🇩 Rupiah (IDR)</SelectItem>
                  <SelectItem value="USD">🇺🇸 Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
              {errors.defaultCurrency && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.defaultCurrency.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="termsAccepted"
                    className="rounded-md border-gray-300 text-myfinance-primary-light focus:ring-myfinance-primary-light"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="termsAccepted" className="text-sm text-gray-600 dark:text-gray-400">
                Saya menyetujui <Link to="/terms" className="text-myfinance-primary-light hover:underline">syarat & ketentuan</Link>
              </Label>
            </div>
            {errors.termsAccepted && <p className="text-red-500 text-sm mt-1 animate-slide-down">{errors.termsAccepted.message}</p>}

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
                  Mendaftar...
                </span>
              ) : (
                "Daftar"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-myfinance-primary-light hover:underline">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;