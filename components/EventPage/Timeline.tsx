'use client';

import { motion } from 'motion/react';
import type { EventData } from '@/lib/types';
import type { StyleConfig } from './getStyleConfig';

interface Props {
  data: EventData;
  ui: StyleConfig;
}

export default function Timeline({ data, ui }: Props) {
  if (!data.schedule || data.schedule.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="mb-32 max-w-6xl mx-auto"
    >
      <div className="text-center mb-20">
        <h2
          className={`${ui.headingFont} text-5xl md:text-6xl mb-6`}
          style={{ lineHeight: data.isRTL ? '1.5' : '1.2' }}
        >
          The Itinerary
        </h2>
        <div className="w-16 h-1 bg-current mx-auto opacity-30 rounded-full" />
      </div>

      <div className="space-y-16 md:space-y-32">
        {data.schedule.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16 items-center`}
          >
            <div className={`w-full md:w-1/2 aspect-[4/3] ${ui.rounding} overflow-hidden ${ui.shadow} ${ui.boxClass}`}>
              {data.images?.timeline?.[i] && (
                <img
                  src={data.images.timeline[i]}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-[1.5s] ease-out"
                />
              )}
            </div>

            <div
              className="w-full md:w-1/2 md:px-8 text-center md:text-start"
              style={data.isRTL ? { textAlign: 'right' } : {}}
            >
              <div
                className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 bg-black/5"
                style={{ color: data.themeColors.primary }}
              >
                {item.time}
              </div>
              <h4
                className={`${ui.headingFont} text-4xl md:text-5xl mb-6`}
                style={{ lineHeight: data.isRTL ? '1.5' : '1.25' }}
              >
                {item.title}
              </h4>
              <p className="font-sans opacity-70 leading-relaxed text-balance text-lg md:text-xl">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
