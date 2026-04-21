export default function Footer() {
  return (
    <footer className="py-12 border-t border-gray-100 bg-[#FDFBF7] text-center">
      <p className="font-serif text-lg text-[#5A5A40] mb-3">✦ Gatherly</p>
      <div className="flex items-center justify-center gap-4 font-sans text-xs text-gray-300">
        <span>Made in Toronto</span>
        <a href="#" className="hover:text-gray-500 transition-colors">Privacy</a>
        <a href="#" className="hover:text-gray-500 transition-colors">Terms</a>
      </div>
    </footer>
  )
}
