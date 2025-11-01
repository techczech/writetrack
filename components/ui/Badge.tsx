import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
  colorClass?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = '', colorClass = 'bg-gray-500', ...props }) => {
  return (
    // Fix: Add ...props to the span element to pass down attributes like onClick.
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
