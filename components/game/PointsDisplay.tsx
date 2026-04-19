'use client';

interface Props {
  points: number;
}

export default function PointsDisplay({ points }: Props) {
  const color =
    points > 15
      ? 'text-green-400'
      : points > 7
      ? 'text-gold-500'
      : points > 0
      ? 'text-crimson-400'
      : 'text-crimson-600';

  const bars = Math.ceil((points / 25) * 5);

  return (
    <div>
      <p className="label mb-1">Detective Points</p>
      <div className="flex items-center gap-2">
        <span className={`points-display ${color}`}>{points}</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-4 border ${
                i < bars
                  ? points > 15
                    ? 'bg-green-500 border-green-500'
                    : points > 7
                    ? 'bg-gold-600 border-gold-600'
                    : 'bg-crimson-600 border-crimson-600'
                  : 'bg-transparent border-noir-600'
              }`}
            />
          ))}
        </div>
      </div>
      {points === 0 && (
        <p className="text-crimson-600 text-xs font-mono mt-1">
          Points exhausted — solve now
        </p>
      )}
    </div>
  );
}
