import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  variant = 'rectangular' 
}) => {
  const baseStyles = "bg-gray-200 animate-pulse";
  
  // All variants are now sharp/rectangular per design request
  const variants = {
    text: "rounded-none",
    circular: "rounded-none", // Keeping name for API compatibility but making it square
    rectangular: "rounded-none"
  };

  const style = {
    width: width,
    height: height
  };

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={style}
    />
  );
};