import React from 'react';
import { DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  showText?: boolean;
  animated?: boolean;
  to?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({
  className,
  textClassName,
  iconClassName,
  showText = true,
  animated = true,
  to = "/",
}) => {
  const content = (
    <>
      <DollarSign className={cn(
        "h-6 w-6",
        iconClassName,
        animated && "animate-fade-in"
      )} />
      {showText && (
        <span className={cn(
          "font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-green to-teal-blue text-2xl",
          textClassName,
          animated && "animate-fade-in delay-100"
        )}>
          MYFINANCE
        </span>
      )}
    </>
  );

  return to ? (
    <Link to={to} className={cn("flex items-center gap-2", className)}>
      {content}
    </Link>
  ) : (
    <div className={cn("flex items-center gap-2", className)}>
      {content}
    </div>
  );
};

export default AppLogo;