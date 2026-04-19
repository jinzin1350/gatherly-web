'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Share2 } from 'lucide-react';
import type { EventData } from '@/lib/types';
import { getStyleConfig } from './getStyleConfig';
import HeroSection from './HeroSection';
import DetailsBar from './DetailsBar';
import DescriptionSplit from './DescriptionSplit';
import Timeline from './Timeline';
import LocationMap from './LocationMap';
import RsvpForm from './RsvpForm';
import ShareModal from './ShareModal';

interface Props {
  data: EventData;
  isFresh?: boolean;
}

export default function EventPageView({ data, isFresh = false }: Props) {
  const [showShare, setShowShare] = useState(false);
  const ui = getStyleConfig(data.uiStyle, data.isRTL);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isFresh ? [0, 1] : 1 }}
      transition={{ duration: isFresh ? 0.8 : 0 }}
      className="min-h-screen pb-32"
      style={{ color: data.themeColors.text, backgroundColor: '#f9f9f9' }}
      dir={data.isRTL ? 'rtl' : 'ltr'}
    >
      {/* Share button */}
      <button
        onClick={() => setShowShare(true)}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 rounded-full bg-white text-black pb-2 text-xs font-semibold pt-2 px-6 shadow-2xl hover:scale-105 transition-all font-sans uppercase tracking-widest"
      >
        <Share2 size={14} /> Share
      </button>

      <ShareModal open={showShare} onClose={() => setShowShare(false)} ui={ui} />

      <HeroSection data={data} ui={ui} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 md:-mt-20 relative z-30">
        <DetailsBar data={data} ui={ui} />
        <DescriptionSplit data={data} ui={ui} />
        <Timeline data={data} ui={ui} />
        <LocationMap data={data} ui={ui} />
        <RsvpForm data={data} ui={ui} />
      </div>

      {/* Footer — free tier only */}
      {data.plan === 'free' && (
        <div className="pb-12 w-full text-center pointer-events-none mt-16">
          <p className="font-sans text-xs tracking-[0.2em] uppercase opacity-40 font-bold">
            Powered by <strong className="font-serif text-sm tracking-normal capitalize">Gatherly</strong>
          </p>
        </div>
      )}
    </motion.div>
  );
}
