import React, { useState } from 'react';
import { Plus, DollarSign, TrendingDown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const QuickActionsFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFab = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex flex-col gap-3 animate-slide-down">
          <Link to="/transactions?type=income">
            <Button
              className="rounded-full w-12 h-12 bg-myfinance-income hover:bg-myfinance-income/90 text-white shadow-lg flex items-center justify-center"
              onClick={toggleFab}
            >
              <DollarSign className="h-5 w-5" />
              <span className="sr-only">Tambah Pendapatan</span>
            </Button>
          </Link>
          <Link to="/transactions?type=expense">
            <Button
              className="rounded-full w-12 h-12 bg-myfinance-expense hover:bg-myfinance-expense/90 text-white shadow-lg flex items-center justify-center"
              onClick={toggleFab}
            >
              <TrendingDown className="h-5 w-5" />
              <span className="sr-only">Tambah Pengeluaran</span>
            </Button>
          </Link>
          <Link to="/budgets">
            <Button
              className="rounded-full w-12 h-12 bg-myfinance-primary-light hover:bg-myfinance-primary-light/90 text-white shadow-lg flex items-center justify-center"
              onClick={toggleFab}
            >
              <Wallet className="h-5 w-5" />
              <span className="sr-only">Atur Budget</span>
            </Button>
          </Link>
        </div>
      )}
      <Button
        className={cn(
          "rounded-full w-14 h-14 bg-gradient-to-r from-emerald-green to-teal-blue hover:from-emerald-green/90 hover:to-teal-blue/90 text-white shadow-xl transition-all duration-300",
          isOpen && "rotate-45"
        )}
        onClick={toggleFab}
      >
        <Plus className="h-7 w-7" />
        <span className="sr-only">Aksi Cepat</span>
      </Button>
    </div>
  );
};

export default QuickActionsFAB;