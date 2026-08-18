'use client';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

export default function Avatar({ src, name, size = 40, className = '' }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (src) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={name || 'Avatar'}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label={name || 'Avatar'}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: size * 0.35,
          fontWeight: 700,
          color: '#444748',
        }}
      >
        {initials}
      </span>
    </div>
  );
}
