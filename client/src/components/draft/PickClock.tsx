import { useState, useEffect } from 'react';

interface Props {
  seconds: number;
  onExpire: () => void;
}

export function PickClock({ seconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return;
    }
    const timer = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onExpire]);

  const pct = (remaining / seconds) * 100;
  const color = remaining > 30 ? '#22c55e' : remaining > 10 ? '#eab308' : '#ef4444';

  return (
    <div className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="13" fill="none" stroke="#374151" strokeWidth="3" />
        <circle
          cx="16" cy="16" r="13"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${2 * Math.PI * 13}`}
          strokeDashoffset={`${2 * Math.PI * 13 * (1 - pct / 100)}`}
          strokeLinecap="round"
          transform="rotate(-90 16 16)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
        <text x="16" y="20" textAnchor="middle" fontSize="10" fill={color} fontWeight="bold">
          {remaining}
        </text>
      </svg>
    </div>
  );
}
