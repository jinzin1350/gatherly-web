import Link from 'next/link';

export default function EventNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFBF7]">
      <p className="font-serif text-7xl mb-8 opacity-20">✦</p>
      <h1 className="font-serif text-4xl text-[#1a1a1a] mb-4">
        Event not found
      </h1>
      <p className="font-sans text-gray-500 mb-10 text-center max-w-sm">
        This event page doesn&rsquo;t exist or may have been removed.
      </p>
      <Link
        href="/"
        className="pill-button bg-[#5A5A40] text-white shadow-md hover:bg-[#4a4a34] font-sans font-medium"
      >
        Create your own event
      </Link>
    </div>
  );
}
