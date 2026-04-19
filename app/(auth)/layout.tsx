import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-crimson-950/30 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-crimson-600 mb-1">
              Case Files
            </p>
            <h1 className="text-2xl font-serif text-noir-50">Solve the Murders</h1>
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
