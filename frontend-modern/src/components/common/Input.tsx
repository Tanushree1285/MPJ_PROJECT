import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  icon: Icon, 
  error, 
  containerClassName = '', 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`input-field ${Icon ? 'pl-11' : ''} ${error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 ml-1 mt-1 flex items-center gap-1 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
