import type { UIStyle } from '@/lib/types';

export type StyleConfig = {
  headingFont: string;
  rounding: string;
  boxClass: string;
  btnClass: string;
  shadow: string;
};

export function getStyleConfig(style: UIStyle, isRTL: boolean): StyleConfig {
  const trackingTight = isRTL ? 'tracking-normal' : 'tracking-tight';
  const trackingTighter = isRTL ? 'tracking-normal' : 'tracking-tighter';

  switch (style) {
    case 'playful':
      return {
        headingFont: `font-sans font-black ${trackingTight}`,
        rounding: 'rounded-[3rem]',
        boxClass: 'border-4 border-black/10',
        btnClass: `rounded-[2rem] border-b-[6px] border-black/20 hover:border-b-0 hover:translate-y-[6px] transition-all font-black uppercase ${isRTL ? 'tracking-normal' : 'tracking-widest'}`,
        shadow: 'shadow-[8px_8px_0px_rgba(0,0,0,0.15)]',
      };
    case 'minimal':
      return {
        headingFont: `font-sans ${trackingTight} font-medium`,
        rounding: 'rounded-none',
        boxClass: 'border border-gray-200',
        btnClass: 'rounded-none hover:bg-black hover:text-white transition-colors font-medium border border-current',
        shadow: 'shadow-sm',
      };
    case 'bold':
      return {
        headingFont: `font-sans font-black uppercase ${trackingTighter}`,
        rounding: 'rounded-xl',
        boxClass: 'border-[6px] border-black',
        btnClass: 'rounded-xl font-black uppercase border-[3px] border-black hover:translate-x-1 hover:-translate-y-1 transition-transform',
        shadow: 'shadow-[8px_8px_0px_#000]',
      };
    case 'romantic':
      return {
        headingFont: 'font-serif font-medium',
        rounding: 'rounded-t-[80px] rounded-b-[40px]',
        boxClass: 'border border-gray-100 bg-white/90',
        btnClass: 'rounded-full hover:scale-105 transition-transform font-serif italic text-xl',
        shadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.05)]',
      };
    case 'elegant':
    default:
      return {
        headingFont: 'font-serif font-medium',
        rounding: 'rounded-[40px]',
        boxClass: 'border border-gray-100',
        btnClass: 'rounded-full hover:scale-105 transition-all font-serif font-semibold text-lg',
        shadow: 'shadow-2xl',
      };
  }
}
