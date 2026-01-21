import React from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Assuming shadcn button is available

const Dashboard = () => {
  const { session, supabase } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!session) {
    // Redirect to login if no session, though App.tsx should handle this
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-blue-600 dark:text-blue-400">
          Selamat Datang di Dashboard Keuangan Anda!
        </h1>
        <p className="text-lg text-center text-gray-700 dark:text-gray-300">
          Anda berhasil login sebagai: <span className="font-semibold">{session.user?.email}</span>
        </p>
        <div className="flex justify-center">
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Logout
          </Button>
        </div>
        <div className="mt-10 text-center text-gray-600 dark:text-gray-400">
          <p>Ini adalah dashboard Anda. Fitur-fitur manajemen keuangan akan ditambahkan di sini.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;