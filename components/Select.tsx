import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  error, 
  className = '', 
  options,
  placeholder,
  value,
  defaultValue,
  ...props 
}) => {
  // If value is not provided (uncontrolled), use defaultValue or "" as default
  const effectiveDefaultValue = value === undefined ? (defaultValue || "") : undefined;

  return (
    <div className="w-full mb-4">
      <div className="relative">
        <select
          className={`
            w-full px-4 py-3 border appearance-none bg-white
            ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-100 focus:border-primary-500'} 
            focus:outline-none focus:ring-4 transition-all duration-200
            text-gray-900
            ${className}
          `}
          value={value}
          defaultValue={effectiveDefaultValue}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown size={20} />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};