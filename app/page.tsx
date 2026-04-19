import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative overflow-hidden">
        {/* Ambient light effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-crimson-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-steel-700/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-crimson-500 mb-6">
            Case Files // Confidential
          </p>

          <h1 className="text-5xl md:text-7xl font-serif font-bold text-noir-50 leading-tight mb-4">
            Solve the
            <span className="block text-crimson-500 text-shadow-red">Murders</span>
          </h1>

          <p className="text-noir-300 text-lg md:text-xl max-w-xl mx-auto mb-3 leading-relaxed">
            An AI-driven detective game. Interrogate witnesses. Check alibis.
            Follow the evidence. Solve the case — before your Detective Points
            run out.
          </p>

          <p className="font-mono text-sm text-noir-400 mb-10">
            One chance to name the killer. Choose wisely.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn btn-primary btn-lg min-w-[180px]">
              Start Investigating
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg min-w-[180px]">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-noir-700 bg-noir-800/50">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔍"
            title="AI Interrogation"
            description="Question suspects powered by Claude AI. Every character has secrets — and the leverage you need to expose them."
          />
          <FeatureCard
            icon="🎯"
            title="Detective Points"
            description="Start with 25 points. Every action costs. Gather facts wisely to earn them back. Reach zero and the only option left is your final accusation."
          />
          <FeatureCard
            icon="📁"
            title="5 Unique Cases"
            description="Three free cases to hone your instincts. Two locked premium cases for detectives who want a real challenge."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-noir-700 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-serif text-center text-noir-50 mb-10">
            How It Works
          </h2>
          <div className="space-y-4">
            {[
              { step: '01', text: 'Select a case from your case board.' },
              { step: '02', text: 'Use your Detective Points to question suspects, investigate scenes, or check alibis.' },
              { step: '03', text: 'Facts extracted from interrogations boost your points.' },
              { step: '04', text: 'When ready — or when your points run out — submit your solution: killer, motive, method.' },
              { step: '05', text: 'One shot. Get it right.' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-4">
                <span className="font-mono text-crimson-600 text-lg tabular-nums shrink-0 w-8">
                  {step}
                </span>
                <p className="text-noir-200">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-noir-700 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-noir-500">
            SOLVE THE MURDERS © {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="font-mono text-xs text-noir-400 hover:text-crimson-400 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="font-mono text-xs text-noir-400 hover:text-crimson-400 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card border-noir-600 hover:border-crimson-800 transition-colors duration-300">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-serif text-lg text-noir-50 mb-2">{title}</h3>
      <p className="text-noir-300 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
