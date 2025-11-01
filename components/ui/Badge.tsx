
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  colorClass?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = '', colorClass = 'bg-gray-500' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${colorClass} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
