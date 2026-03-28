import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { T } from '../../styles/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const SIZE_STYLE: Record<ButtonSize, CSSProperties> = {
  sm: { height: 30, padding: '0 10px', fontSize: 11 },
  md: { height: 36, padding: '0 12px', fontSize: 12 },
  lg: { height: 42, padding: '0 14px', fontSize: 13 },
};

const VARIANT_STYLE: Record<ButtonVariant, CSSProperties> = {
  primary: {
    border: `1px solid ${T.borderFoc}`,
    background: `linear-gradient(135deg, ${T.blue} 0%, ${T.blueBright} 100%)`,
    color: T.txtInvert,
  },
  secondary: {
    border: `1px solid ${T.border}`,
    background: T.panel,
    color: T.txt,
  },
  ghost: {
    border: `1px solid ${T.border}`,
    background: 'transparent',
    color: T.txtSub,
  },
  danger: {
    border: `1px solid rgba(255,23,68,0.45)`,
    background: 'rgba(255,23,68,0.12)',
    color: T.red,
  },
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  leftIcon,
  rightIcon,
  disabled,
  style,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        ...SIZE_STYLE[size],
        ...VARIANT_STYLE[variant],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        borderRadius: 9,
        fontFamily: T.fontBase,
        fontWeight: 700,
        letterSpacing: '0.03em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        whiteSpace: 'nowrap',
        transition: 'transform 120ms ease, filter 120ms ease, border-color 120ms ease',
        ...style,
      }}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

export { Button };
