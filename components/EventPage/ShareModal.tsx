'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode as QrCodeIcon } from 'lucide-react';
import QRCode from 'react-qr-code';
import type { StyleConfig } from './getStyleConfig';

interface Props {
  open: boolean;
  onClose: () => void;
  ui: StyleConfig;
}

export default function ShareModal({ open, onClose, ui }: Props) {
  const url = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 font-sans"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className={`${ui.rounding} bg-white p-10 max-w-sm w-full ${ui.shadow} relative text-gray-900 ${ui.boxClass}`}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-10">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                <QrCodeIcon size={28} className="text-gray-700" />
              </div>
              <h3 className={`text-3xl ${ui.headingFont} text-gray-900 mb-3 text-balance`}>
                Invite your guests
              </h3>
            </div>

            <div className={`bg-white p-6 ${ui.rounding} border border-gray-100 shadow-sm flex justify-center mb-8`}>
              <QRCode value={url} size={180} fgColor="#1a1a1a" />
            </div>

            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                dir="ltr"
                className="flex-1 bg-gray-50 border border-transparent rounded-2xl px-5 py-4 text-xs text-gray-600 outline-none focus:border-gray-200 transition-colors"
              />
              <button
                onClick={handleCopy}
                className="bg-gray-900 text-white rounded-2xl px-5 py-4 text-xs font-semibold tracking-wide shadow-md hover:bg-black transition-all shrink-0"
              >
                Copy
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
