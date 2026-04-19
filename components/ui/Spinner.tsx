import { Loader2 } from 'lucide-react';

interface Props {
  size?: number;
  label?: string;
  className?: string;
}

export default function Spinner({ size = 48, label, className = '' }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <Loader2
        size={size}
        className="animate-spin text-[#5A5A40]"
        strokeWidth={1.5}
      />
      {label && (
        <p className="font-serif text-2xl text-[#1a1a1a] animate-pulse">{label}</p>
      )}
    </div>
  );
}
