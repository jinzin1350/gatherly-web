import { type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = '', id, ...props }: Props) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase tracking-widest pl-2 mb-2 opacity-60"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition-all font-sans text-base ${className}`}
        {...props}
      />
    </div>
  );
}
