'use client';

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { EventData } from '@/lib/types';
import type { StyleConfig } from './getStyleConfig';

interface Props {
  data: EventData;
  ui: StyleConfig;
}

export default function DescriptionSplit({ data, ui }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden ${ui.rounding} ${ui.shadow} bg-white ${ui.boxClass} mb-32`}
      style={{ backgroundColor: data.themeColors.background }}
    >
      <div
        className="p-8 lg:p-24 flex flex-col justify-center text-center lg:text-start"
        style={data.isRTL ? { textAlign: 'right' } : {}}
      >
        <Sparkles
          className={`mb-8 opacity-40 ${data.isRTL ? 'mr-auto lg:mr-0 ml-auto lg:ml-auto' : 'mx-auto lg:mx-0'}`}
          size={32}
        />
        <p
          className={`${ui.headingFont} text-3xl md:text-4xl leading-relaxed text-balance`}
          style={{ lineHeight: data.isRTL ? '1.7' : '1.5' }}
        >
          {data.description}
        </p>
      </div>

      <div className="relative min-h-[300px] lg:min-h-full w-full">
        {data.images?.details && (
          <img
            src={data.images.details}
            alt="Event detail"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
    </motion.div>
  );
}
