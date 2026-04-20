import AISettingsForm from '@/components/Admin/AISettingsForm';

export default function AISettingsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 md:p-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl font-light text-[#1a1a1a] mb-2">
          AI Settings
        </h1>
        <p className="text-sm text-gray-400 font-sans mb-12">
          Switch the active AI provider app-wide. Changes take effect within 60 seconds.
        </p>
        <AISettingsForm />
      </div>
    </div>
  );
}
