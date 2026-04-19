import { type ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  themeColor?: string;
}

export default function Button({
  variant = 'primary',
  themeColor,
  className = '',
  children,
  style,
  ...props
}: Props) {
  const base = 'pill-button inline-flex items-center justify-center gap-2 font-sans font-medium transition-all disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-[#5A5A40] text-white hover:bg-[#4a4a34] shadow-md',
    ghost: 'text-gray-500 hover:bg-gray-100',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={themeColor ? { backgroundColor: themeColor, ...style } : style}
      {...props}
    >
      {children}
    </button>
  );
}
