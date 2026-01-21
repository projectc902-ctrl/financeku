import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Login = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Selamat Datang di Aplikasi Keuangan Anda
        </h2>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(222.2 47.4% 11.2%)', // Primary color for buttons
                  brandAccent: 'hsl(217.2 91.2% 59.8%)', // Accent color for hover
                  inputBackground: 'hsl(210 40% 96.1%)', // Light background for inputs
                  inputBorder: 'hsl(214.3 31.8% 91.4%)', // Light border for inputs
                  inputFocusBorder: 'hsl(217.2 91.2% 59.8%)', // Focus border color
                  inputText: 'hsl(222.2 84% 4.9%)', // Dark text for inputs
                  messageText: 'hsl(222.2 84% 4.9%)', // Message text color
                  messageBackground: 'hsl(210 40% 96.1%)', // Message background
                },
                radii: {
                  borderRadiusButton: '0.75rem', // Rounded buttons
                  button: '0.75rem',
                  input: '0.75rem',
                },
              },
            },
          }}
          theme="light" // Default to light theme
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email Anda',
                password_label: 'Kata Sandi Anda',
                email_input_placeholder: 'Masukkan email Anda',
                password_input_placeholder: 'Masukkan kata sandi Anda',
                button_label: 'Masuk',
                social_provider_text: 'Masuk dengan {{provider}}',
                link_text: 'Sudah punya akun? Masuk',
              },
              sign_up: {
                email_label: 'Email Anda',
                password_label: 'Buat Kata Sandi',
                email_input_placeholder: 'Masukkan email Anda',
                password_input_placeholder: 'Buat kata sandi yang kuat',
                button_label: 'Daftar',
                social_provider_text: 'Daftar dengan {{provider}}',
                link_text: 'Belum punya akun? Daftar',
              },
              forgotten_password: {
                email_label: 'Email Anda',
                password_label: 'Kata Sandi Baru Anda',
                email_input_placeholder: 'Masukkan email Anda',
                button_label: 'Kirim instruksi reset',
                link_text: 'Lupa kata sandi?',
              },
              update_password: {
                password_label: 'Kata Sandi Baru',
                password_input_placeholder: 'Masukkan kata sandi baru Anda',
                button_label: 'Perbarui kata sandi',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;