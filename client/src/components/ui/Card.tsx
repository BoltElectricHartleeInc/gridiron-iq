import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { T } from '../../styles/tokens';

type CardVariant = 'surface' | 'panel' | 'elevated' | 'soft';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: CardVariant;
  style?: CSSProperties;
  className?: string;
};

function baseStyle(variant: CardVariant): CSSProperties {
  switch (variant) {
    case 'panel':
      return { background: T.panel, border: `1px solid ${T.border}` };
    case 'elevated':
      return { background: T.elevated, border: `1px solid ${T.borderHi}` };
    case 'soft':
      return { background: T.blueSub, border: `1px solid ${T.borderFoc}` };
    case 'surface':
    default:
      return { background: T.surface, border: `1px solid ${T.border}` };
  }
}

export default function Card({ children, variant = 'surface', style, className, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={className}
      style={{
        borderRadius: 12,
        ...baseStyle(variant),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
