'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/camera', icon: 'photo_camera', label: 'MÁY ẢNH' },
  { href: '/feed', icon: 'grid_view', label: 'LƯĂ TRỮ' },
  { href: '/map', icon: 'map', label: 'BẢN ĐỔ' },
  { href: '/profile', icon: 'person_2', label: 'HỒ SƠ' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant"
      style={{ boxShadow: '0 -4px 0 0 rgba(0,0,0,0.05)' }}
      aria-label="Navigation chính"
    >
      <div className="flex justify-around items-center px-4 pb-4 h-20">
        {TABS.map(tab => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center pt-2 w-full h-full transition-colors ${
                isActive
                  ? 'text-primary border-t-2 border-primary translate-y-1'
                  : 'text-outline hover:bg-surface-container-low'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className="material-symbols-outlined mb-1 text-[24px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {tab.icon}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  fontWeight: 500,
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
