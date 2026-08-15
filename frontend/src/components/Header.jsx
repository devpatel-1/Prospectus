export default function Header() {
  return (
    <header className="border-b border-rule bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full border-2 border-ink flex items-center justify-center">
            <span className="font-display text-sm font-medium text-ink">P</span>
          </div>
          <div>
            <p className="font-display text-xl font-medium text-ink leading-none">Prospectus</p>
            <p className="font-mono text-[10px] tracking-widest text-slate uppercase mt-0.5">Company Brief Generator</p>
          </div>
        </div>
        <a href="https://github.com/" target="_blank" rel="noreferrer" className="font-mono text-xs text-slate hover:text-ink transition-colors focus-ring rounded px-2 py-1">View on GitHub ↗</a>
      </div>
    </header>
  );
}