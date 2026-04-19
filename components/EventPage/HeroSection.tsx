'use client';

import { motion } from 'motion/react';
import type { EventData } from '@/lib/types';
import type { StyleConfig } from './getStyleConfig';

interface Props {
  data: EventData;
  ui: StyleConfig;
}

export default function HeroSection({ data, ui }: Props) {
  return (
    <div className="relative w-full h-[85vh] lg:h-[90vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-10" />

      {data.images?.hero && (
        <motion.img
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src={data.images.hero}
          alt={data.themeName}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-16 lg:p-24 pb-20 md:pb-32 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="w-full"
        >
          <div
            className={`inline-block px-4 py-2 ${ui.rounding} text-xs font-bold tracking-[0.15em] uppercase mb-6 md:mb-8 backdrop-blur-md bg-white/15 text-white border border-white/20`}
            style={data.isRTL ? { letterSpacing: 'normal' } : {}}
          >
            {data.themeName}
          </div>

          <h1
            className={`${ui.headingFont} text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-white mb-6 md:mb-8 text-balance drop-shadow-xl`}
            style={{ lineHeight: data.isRTL ? '1.5' : '1.1' }}
          >
            {data.title}
          </h1>

          <p
            className={`${data.uiStyle === 'bold' ? 'font-sans font-bold' : 'font-serif italic'} text-xl md:text-3xl text-white/90 drop-shadow-md text-balance max-w-3xl`}
            style={data.isRTL ? { fontStyle: 'normal' } : {}}
          >
            {data.welcomeMessage}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
