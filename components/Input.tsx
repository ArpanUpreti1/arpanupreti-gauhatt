import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  icon,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  
  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="w-full mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : type}
          className={`
            w-full px-4 py-3 border bg-white
            ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-100 focus:border-primary-500'} 
            focus:outline-none focus:ring-4 transition-all duration-200
            ${icon ? 'pr-10' : ''}
            text-gray-900 placeholder-gray-400
            ${className}
          `}
          {...props}
        />
        {/* Render provided icon (like user or mail) */}
        {icon && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        
        {/* Password toggle overrides other icons if type is password */}
        {isPassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};