'use client';

import { motion } from 'motion/react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { EventData } from '@/lib/types';
import type { StyleConfig } from './getStyleConfig';

interface Props {
  data: EventData;
  ui: StyleConfig;
}

export default function DetailsBar({ data, ui }: Props) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className={`bg-white ${ui.rounding} ${ui.shadow} ${ui.boxClass} overflow-hidden mb-16 md:mb-32`}
      style={{ backgroundColor: data.themeColors.background }}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b"
        style={{ borderColor: `${data.themeColors.text}15` }}
      >
        <div className="p-8 lg:p-12 flex flex-col items-center justify-center text-center gap-4 hover:bg-black/5 transition-colors">
          <Calendar size={28} style={{ color: data.themeColors.primary }} strokeWidth={1.5} />
          <div>
            <p className="font-sans font-bold text-xs tracking-[0.2em] uppercase mb-2 opacity-60">When</p>
            <p className={`${ui.headingFont} text-2xl`}>{data.date}</p>
          </div>
        </div>

        <div className="p-8 lg:p-12 flex flex-col items-center justify-center text-center gap-4 hover:bg-black/5 transition-colors">
          <Clock size={28} style={{ color: data.themeColors.primary }} strokeWidth={1.5} />
          <div>
            <p className="font-sans font-bold text-xs tracking-[0.2em] uppercase mb-2 opacity-60">Time</p>
            <p className={`${ui.headingFont} text-2xl`}>{data.time}</p>
          </div>
        </div>

        <div className="p-8 lg:p-12 flex flex-col items-center justify-center text-center gap-4 hover:bg-black/5 transition-colors">
          <MapPin size={28} style={{ color: data.themeColors.primary }} strokeWidth={1.5} />
          <div>
            <p className="font-sans font-bold text-xs tracking-[0.2em] uppercase mb-2 opacity-60">Where</p>
            <p className={`${ui.headingFont} text-2xl tracking-normal leading-tight text-balance`}>{data.location}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
