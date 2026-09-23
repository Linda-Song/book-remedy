export function Navbar() {
  return (
    <header className="h-14 px-16 flex items-center justify-between bg-bg-tint">
      <div className="flex items-center gap-3">
        <span>RR</span>
        <span className="font-bold text-lg text-text-primary">ReadRemedy</span>
      </div>
      <nav className="flex items-center gap-9 text-lg">
        <span className="text-text-secondary">How it works</span>
        <span className="font-bold text-green-dark">Sign in</span>
      </nav>
    </header>
  );
}
