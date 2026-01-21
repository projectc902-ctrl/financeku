import React from 'react';
import { CheckCircle, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
  delay: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text, delay }) => (
  <div className={cn("flex items-center gap-3 opacity-0 animate-slide-down")} style={{ animationDelay: `${delay}ms` }}>
    <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white">
      {icon}
    </div>
    <p className="text-white text-lg font-medium">{text}</p>
  </div>
);

const LoginHero: React.FC = () => {
  const features = [
    { icon: <CheckCircle className="h-5 w-5" />, text: "Lacak Pendapatan & Pengeluaran", delay: 200 },
    { icon: <TrendingUp className="h-5 w-5" />, text: "Analisis Kesehatan Finansial", delay: 300 },
    { icon: <Wallet className="h-5 w-5" />, text: "Rencanakan Anggaran dengan Mudah", delay: 400 },
    { icon: <ShieldCheck className="h-5 w-5" />, text: "Data Aman & Terorganisir", delay: 500 },
  ];

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center p-8 text-center lg:text-left">
      {/* Background Illustration/Image with Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-green to-teal-blue opacity-90 rounded-2xl lg:rounded-none"></div>
      <img
        src="/placeholder.svg" // Placeholder image, replace with actual illustration
        alt="MYFINANCE Features"
        className="absolute inset-0 w-full h-full object-cover opacity-20 animate-float"
      />
      <div className="relative z-10 space-y-6 max-w-md lg:max-w-none lg:self-start lg:ml-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight animate-fade-in">
          Kelola Keuangan Anda Dengan Mudah
        </h1>
        <p className="text-xl text-white/90 mt-4 animate-fade-in delay-100">
          MYFINANCE membantu Anda mencapai tujuan finansial dengan alat yang intuitif dan powerful.
        </p>
        <div className="mt-8 space-y-4 lg:space-y-6">
          {features.map((feature, index) => (
            <FeatureItem key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginHero;