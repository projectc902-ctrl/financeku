import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, DollarSign, ListChecks, Wallet, BarChart, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive, onClick }) => (
  <Link to={to} onClick={onClick} className={cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-blue-100 dark:text-gray-50 dark:hover:bg-gray-700",
    isActive && "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
  )}>
    {icon}
    {label}
  </Link>
);

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { supabase } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
    { to: '/transactions', icon: <DollarSign className="h-5 w-5" />, label: 'Transaksi' },
    { to: '/categories', icon: <ListChecks className="h-5 w-5" />, label: 'Kategori' },
    { to: '/budgets', icon: <Wallet className="h-5 w-5" />, label: 'Anggaran' },
    { to: '/reports', icon: <BarChart className="h-5 w-5" />, label: 'Laporan' },
    { to: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Pengaturan' },
  ];

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex h-full max-h-screen flex-col gap-4 p-4">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 text-xl">
          <DollarSign className="h-6 w-6" />
          <span>FinansiaKu</span>
        </Link>
      </div>
      <nav className="grid items-start gap-2 text-sm font-medium lg:px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.to}
            onClick={onClose}
          />
        ))}
      </nav>
      <div className="mt-auto p-4 border-t dark:border-gray-700">
        <Button
          onClick={() => { handleLogout(); onClose?.(); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-red-600 transition-all hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
          variant="ghost"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar for desktop */}
      <div className="hidden border-r bg-gray-100 dark:bg-gray-900 md:block">
        <SidebarContent />
      </div>

      {/* Mobile header and sidebar */}
      {isMobile && (
        <header className="flex h-14 items-center gap-4 border-b bg-gray-100 dark:bg-gray-900 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[280px] sm:w-[320px] p-0">
              <SidebarContent onClose={() => { /* Close sheet logic if needed */ }} />
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 text-xl">
            <DollarSign className="h-6 w-6" />
            <span>FinansiaKu</span>
          </Link>
        </header>
      )}

      {/* Main content area */}
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;