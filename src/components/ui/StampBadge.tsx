import { ReactNode } from 'react';

interface StampBadgeProps {
  children: ReactNode;
  variant?: 'red' | 'gold' | 'neutral';
  rotate?: number;
}

export default function StampBadge({ children, variant = 'neutral', rotate = -3 }: StampBadgeProps) {
  const colors = {
    red: { color: '#b71032', border: '#b71032' },
    gold: { color: '#cca730', border: '#cca730' },
    neutral: { color: '#747878', border: '#747878' },
  };
  const { color, border } = colors[variant];

  return (
    <span
      style={{
        display: 'inline-block',
        border: `1px dashed ${border}`,
        color,
        padding: '4px 8px',
        transform: `rotate(${rotate}deg)`,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px',
        letterSpacing: '0.1em',
        fontWeight: 500,
        lineHeight: 1,
        textTransform: 'uppercase',
        opacity: 0.85,
      }}
    >
      {children}
    </span>
  );
}
