'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import type { AIConfig, ProviderMeta } from '@/lib/ai/types';
import Button from '@/components/ui/Button';

type Providers = { text: ProviderMeta[]; image: ProviderMeta[] };

export default function AISettingsForm() {
  const [config, setConfig]       = useState<AIConfig | null>(null);
  const [providers, setProviders] = useState<Providers | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/ai-config').then(r => r.json()),
      fetch('/api/admin/ai-config/providers').then(r => r.json()),
    ]).then(([cfg, prov]) => {
      if (cfg.ok)  setConfig(cfg.data);
      if (prov.ok) setProviders(prov.data);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? 'Save failed');
      setConfig(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!config || !providers) {
    return <p className="text-sm text-gray-400 font-sans">Loading…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-lg">
      {/* Text provider */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          Text provider
        </label>
        <select
          value={config.textProvider}
          onChange={e => setConfig({ ...config, textProvider: e.target.value as AIConfig['textProvider'] })}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-sans outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-all bg-white"
        >
          {providers.text.map(p => (
            <option key={p.id} value={p.id} disabled={!p.available}>
              {p.displayName}{!p.available ? ' (no API key)' : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400">
          {providers.text.find(p => p.id === config.textProvider)?.description}
        </p>
      </div>

      {/* Image provider */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          Image provider
        </label>
        <select
          value={config.imageProvider}
          onChange={e => setConfig({ ...config, imageProvider: e.target.value as AIConfig['imageProvider'] })}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-sans outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-all bg-white"
        >
          {providers.image.map(p => (
            <option key={p.id} value={p.id} disabled={!p.available}>
              {p.displayName}{!p.available ? ' (no API key)' : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400">
          {providers.image.find(p => p.id === config.imageProvider)?.description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-sans">
            <CheckCircle size={16} /> Saved
          </span>
        )}
        {error && <span className="text-sm text-red-500 font-sans">{error}</span>}
      </div>
    </form>
  );
}
