import type { CSSProperties, ReactNode } from 'react';
import { T } from '../../styles/tokens';

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'gold' | 'danger';

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  style?: CSSProperties;
  className?: string;
};

function rgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '').trim();
  const normalized =
    raw.length === 3
      ? raw
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : raw;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function paletteForTone(tone: BadgeTone): { bg: string; border: string; text: string } {
  switch (tone) {
    case 'blue':
      return { bg: T.blueSub, border: rgba(T.blueBright, 0.45), text: T.blueBright };
    case 'green':
      return { bg: T.greenSub, border: rgba(T.green, 0.4), text: T.green };
    case 'amber':
      return { bg: rgba(T.amber, 0.12), border: rgba(T.amber, 0.4), text: T.amber };
    case 'gold':
      return { bg: rgba(T.gold, 0.12), border: rgba(T.gold, 0.45), text: T.goldBright };
    case 'danger':
      return { bg: T.redSub, border: rgba(T.red, 0.4), text: T.red };
    case 'neutral':
    default:
      return { bg: T.panel, border: T.border, text: T.txtSub };
  }
}

export default function Badge({ children, tone = 'neutral', style, className }: BadgeProps) {
  const palette = paletteForTone(tone);
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        color: palette.text,
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        lineHeight: 1,
        padding: '4px 7px',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export { Badge };
