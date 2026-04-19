'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { EventData } from '@/lib/types';
import type { StyleConfig } from './getStyleConfig';

interface Props {
  data: EventData;
  ui: StyleConfig;
}

export default function RsvpForm({ data, ui }: Props) {
  const [rsvpState, setRsvpState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpState('submitting');
    const res = await api.submitRsvp(data.eventId, {
      name,
      email,
      attending: true,
    });
    if (res.ok) {
      setRsvpState('success');
    } else {
      setRsvpState('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className={`grid grid-cols-1 lg:grid-cols-2 overflow-hidden ${ui.rounding} ${ui.shadow} ${ui.boxClass} mb-16`}
      style={{ backgroundColor: data.themeColors.background }}
    >
      <div className="relative min-h-[300px] lg:min-h-[600px] w-full">
        {data.images?.rsvp && (
          <img
            src={data.images.rsvp}
            alt="RSVP"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      <div
        className="p-8 sm:p-10 md:p-16 lg:p-20 flex flex-col justify-center"
        style={data.isRTL ? { textAlign: 'right' } : {}}
      >
        <h2
          className={`${ui.headingFont} text-5xl md:text-6xl mb-6`}
          style={{ lineHeight: data.isRTL ? '1.5' : '1.25' }}
        >
          Will we see you?
        </h2>
        <p className="font-sans opacity-70 mb-12 text-lg text-balance" style={{ lineHeight: '1.7' }}>
          Leave your email to automatically receive the shared photo gallery after the gathering.
        </p>

        <AnimatePresence mode="wait">
          {rsvpState === 'success' ? (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className={`bg-white/40 backdrop-blur-md ${ui.rounding} p-12 flex flex-col items-center gap-6 shadow-xl border border-white/50 text-center`}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-green-50 shadow-inner text-green-600">
                <Heart size={36} fill="currentColor" className="opacity-90" />
              </div>
              <h3
                className={`${ui.headingFont} text-4xl`}
                style={{ lineHeight: '1.25' }}
              >
                Cannot Wait!
              </h3>
              <p className="font-sans opacity-70 text-lg">
                Your reservation is confirmed. See you there.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 font-sans text-start w-full"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest pl-2 mb-3 opacity-60">
                    Guest Name
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={`w-full px-6 py-5 bg-white border border-gray-200 shadow-sm focus:ring-2 focus:ring-black outline-none transition-all ${ui.rounding} text-lg`}
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest pl-2 mb-3 opacity-60">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full px-6 py-5 bg-white border border-gray-200 shadow-sm focus:ring-2 focus:ring-black outline-none transition-all ${ui.rounding} text-lg`}
                    placeholder="For the gallery link"
                  />
                </div>
              </div>

              {rsvpState === 'error' && (
                <p className="text-red-500 text-sm pl-2">Something went wrong. Please try again.</p>
              )}

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={rsvpState === 'submitting'}
                  className={`w-full ${ui.btnClass} flex justify-center items-center py-6 text-lg shadow-xl disabled:opacity-60`}
                  style={{
                    backgroundColor: data.themeColors.primary,
                    color: data.themeColors.background,
                  }}
                >
                  {rsvpState === 'submitting' ? 'Confirming...' : 'Yes, I will attend'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
