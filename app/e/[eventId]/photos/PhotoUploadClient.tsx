'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, ImagePlus, RotateCcw, X } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

type FileStatus = 'idle' | 'uploading' | 'done' | 'error';

interface FileEntry {
  id:       string;
  file:     File;
  preview:  string;
  status:   FileStatus;
  progress: number;
  errorMsg: string;
}

interface Props {
  eventId:     string;
  eventTitle:  string;
  uploadToken: string | null; // null = host session, string = guest token
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

const MAX_BYTES = 10 * 1024 * 1024;

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhotoUploadClient({ eventId, eventTitle, uploadToken }: Props) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Add files ──────────────────────────────────────────────────────────────
  const addFiles = useCallback((raw: FileList | File[]) => {
    const files = Array.from(raw).filter(f => f.type.startsWith('image/'));
    const newEntries: FileEntry[] = files.map(f => ({
      id:       uid(),
      file:     f,
      preview:  URL.createObjectURL(f),
      status:   f.size > MAX_BYTES ? 'error' : 'idle',
      progress: 0,
      errorMsg: f.size > MAX_BYTES ? `File exceeds 10 MB (${formatBytes(f.size)})` : '',
    }));
    setEntries(prev => [...prev, ...newEntries]);
  }, []);

  // ── Remove file ────────────────────────────────────────────────────────────
  const removeEntry = useCallback((id: string) => {
    setEntries(prev => {
      const entry = prev.find(e => e.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter(e => e.id !== id);
    });
  }, []);

  // ── Upload one file (XHR for real progress) ────────────────────────────────
  const uploadEntry = useCallback(async (id: string) => {
    setEntries(prev =>
      prev.map(e => e.id === id ? { ...e, status: 'uploading', progress: 0, errorMsg: '' } : e)
    );

    const entry = entries.find(e => e.id === id);
    if (!entry || entry.file.size > MAX_BYTES) return;

    const body = new FormData();
    body.append('file', entry.file);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `/api/events/${eventId}/photos/upload`);

        // Pass guest token as header if present; host relies on session cookie
        if (uploadToken) {
          xhr.setRequestHeader('X-Upload-Token', uploadToken);
        }

        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setEntries(prev =>
              prev.map(en => en.id === id ? { ...en, progress: pct } : en)
            );
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            try {
              const j = JSON.parse(xhr.responseText);
              reject(new Error(j?.error?.message ?? `HTTP ${xhr.status}`));
            } catch {
              reject(new Error(`HTTP ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.send(body);
      });

      setEntries(prev =>
        prev.map(e => e.id === id ? { ...e, status: 'done', progress: 100 } : e)
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setEntries(prev =>
        prev.map(e => e.id === id ? { ...e, status: 'error', errorMsg: msg } : e)
      );
    }
  }, [entries, eventId, uploadToken]);

  // ── Upload all idle ────────────────────────────────────────────────────────
  const uploadAll = useCallback(() => {
    entries
      .filter(e => e.status === 'idle')
      .forEach(e => uploadEntry(e.id));
  }, [entries, uploadEntry]);

  // ── Drag events ────────────────────────────────────────────────────────────
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Revoke object URLs on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => { entries.forEach(e => URL.revokeObjectURL(e.preview)); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────
  const idleCount      = entries.filter(e => e.status === 'idle').length;
  const uploadingCount = entries.filter(e => e.status === 'uploading').length;
  const doneCount      = entries.filter(e => e.status === 'done').length;
  const allDone        = entries.length > 0 && doneCount === entries.length;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-[#5A5A40] flex items-center justify-center shrink-0">
            <Camera size={16} className="text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-serif text-xl text-[#1a1a1a] leading-tight">
              {eventTitle || 'Share your photos'}
            </p>
            <p className="text-xs text-gray-400 font-sans">
              Your memories from the celebration
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={[
            'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 mb-6',
            dragging
              ? 'border-[#5A5A40] bg-[#5A5A40]/5 scale-[1.01]'
              : 'border-gray-200 hover:border-[#5A5A40]/50 hover:bg-gray-50',
          ].join(' ')}
        >
          <ImagePlus size={28} className="mx-auto mb-3 text-gray-300" strokeWidth={1.5} />
          <p className="font-sans text-sm text-gray-500 mb-1">
            {dragging ? 'Drop photos here' : 'Tap to add photos'}
          </p>
          <p className="font-sans text-xs text-gray-300">
            JPG, PNG, HEIC · up to 10 MB each
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
        />

        {/* File grid */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {entries.map(entry => (
              <div key={entry.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">

                <img
                  src={entry.preview}
                  alt={entry.file.name}
                  className="w-full h-full object-cover"
                />

                {entry.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="14"
                        fill="none" stroke="white" strokeWidth="3"
                        strokeDasharray={`${(entry.progress / 100) * 87.96} 87.96`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-white text-xs font-sans mt-1">{entry.progress}%</span>
                  </div>
                )}

                {entry.status === 'done' && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-white drop-shadow" />
                  </div>
                )}

                {entry.status === 'error' && (
                  <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center gap-1 p-2">
                    <p className="text-white text-[10px] font-sans text-center leading-tight">
                      {entry.errorMsg}
                    </p>
                    {entry.file.size <= MAX_BYTES && (
                      <button
                        onClick={e => { e.stopPropagation(); uploadEntry(entry.id); }}
                        className="mt-1 text-white/80 hover:text-white"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </div>
                )}

                {(entry.status === 'idle' || entry.status === 'error') && (
                  <button
                    onClick={e => { e.stopPropagation(); removeEntry(entry.id); }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={11} className="text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col items-center gap-4">
          {idleCount > 0 && uploadingCount === 0 && !allDone && (
            <Button onClick={uploadAll} className="w-full">
              Upload {idleCount} photo{idleCount !== 1 ? 's' : ''} →
            </Button>
          )}

          {uploadingCount > 0 && (
            <p className="text-sm text-gray-400 font-sans">
              Uploading {uploadingCount} photo{uploadingCount !== 1 ? 's' : ''}…
            </p>
          )}

          {allDone && (
            <div className="text-center">
              <p className="font-serif text-lg text-[#1a1a1a] mb-1">
                All uploaded ✦
              </p>
              <p className="text-sm text-gray-400 font-sans mb-4">
                Your photos have been added to the gallery.
              </p>
            </div>
          )}

          <Link
            href={`/e/${eventId}/gallery`}
            className="text-xs text-gray-400 font-sans hover:text-gray-600 transition-colors"
          >
            ← View the gallery
          </Link>
        </div>

      </div>
    </div>
  );
}
