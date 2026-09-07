import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 
    'inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8.5 rounded-full font-bold',
    md: 'text-sm px-5 py-2.5 gap-2 h-10.5 rounded-full font-bold',
    lg: 'text-base px-7 py-3 gap-2.5 h-12.5 rounded-full font-bold'
  };

  const variantStyles = {
    // Deep sleek ocean teal (#0F4C5C)
    primary: 'bg-[#0F4C5C] text-white hover:bg-[#0a3a46] active:bg-[#082e38] focus-visible:ring-[#0F4C5C] shadow-md hover:shadow-lg',
    // Warm vibrant amber/orange accent (#F27D26)
    accent: 'bg-[#F27D26] text-white hover:bg-[#e06b16] active:bg-[#c95d0f] focus-visible:ring-[#F27D26] shadow-lg hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-[#0F4C5C] hover:border-[#0F4C5C]/30 active:bg-gray-100 focus-visible:ring-gray-300 shadow-soft',
    outline: 'bg-transparent text-[#0F4C5C] border border-[#0F4C5C] hover:bg-[#0F4C5C]/5 active:bg-[#0F4C5C]/10 focus-visible:ring-[#0F4C5C]',
    ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-[#0F4C5C] active:bg-gray-200 focus-visible:ring-gray-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500 shadow-sm'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
