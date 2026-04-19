export default function TestimonialCard() {
  return (
    <div className="hidden lg:block relative p-6 pointer-events-none">
      <div className="w-full h-full rounded-[40px] overflow-hidden relative shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          alt="Elegant gathering"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <div className="glass-panel p-8 rounded-3xl text-white backdrop-blur-md border border-white/20">
            <p className="font-serif italic text-2xl mb-2">
              &ldquo;The best party we&rsquo;ve ever hosted.&rdquo;
            </p>
            <p className="font-sans text-sm font-medium tracking-wider uppercase opacity-80">
              Aria&rsquo;s 30th Birthday
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
