'use client';

import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { EventData } from '@/lib/types';
import type { StyleConfig } from './getStyleConfig';

interface Props {
  data: EventData;
  ui: StyleConfig;
}

export default function LocationMap({ data, ui }: Props) {
  const mapsKey = process.env.NEXT_PUBLIC_MAPS_API_KEY ?? '';
  const encodedLocation = encodeURIComponent(data.location);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className={`mb-32 ${ui.rounding} overflow-hidden ${ui.shadow} bg-white ${ui.boxClass} p-4 md:p-6`}
      style={{ backgroundColor: data.themeColors.background }}
    >
      <div className={`w-full h-[400px] md:h-[500px] ${ui.rounding} overflow-hidden relative`}>
        <iframe
          title="Event Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodedLocation}`}
        />
      </div>

      <div className="text-center mt-8 mb-4 flex justify-center">
        <a
          href={`https://maps.google.com/?q=${encodedLocation}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 font-sans font-bold text-sm tracking-[0.1em] uppercase hover:opacity-60 transition-opacity bg-black text-white px-8 py-4 rounded-full shadow-lg"
        >
          <span>Directions via Google</span>
          <ArrowRight size={16} />
        </a>
      </div>
    </motion.div>
  );
}
