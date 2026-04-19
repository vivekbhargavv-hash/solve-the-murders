'use client';

interface Props {
  suspects: { id: string; name: string; role: string; description: string }[];
  onClose: () => void;
}

export default function SuspectsList({ suspects, onClose }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-5 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-noir-50">Key People</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕ Close</button>
        </div>

        <div className="space-y-3">
          {suspects.map((s) => (
            <div key={s.id} className="card border-noir-600">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-serif text-noir-50 text-base">{s.name}</h4>
                  <p className="font-mono text-xs text-crimson-600 uppercase tracking-wider">
                    {s.role}
                  </p>
                </div>
              </div>
              {s.description && (
                <p className="text-noir-300 text-sm mt-2 leading-relaxed">{s.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
