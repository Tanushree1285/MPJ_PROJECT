import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  loading, 
  variant = 'primary', 
  fullWidth, 
  icon,
  className = '',
  disabled,
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-md hover:shadow-lg',
    ghost: 'text-slate-500 hover:bg-slate-100'
  };

  const baseClasses = `flex items-center justify-center gap-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${variants[variant]} ${className}`;

  return (
    <button
      className={baseClasses}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
      {children}
    </button>
  );
};

export default Button;
