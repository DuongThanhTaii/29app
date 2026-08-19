import React from 'react';

export function InstaxMiniIcon({ size = 24, active = false }: { size?: number, active?: boolean }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 54 86" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-200" style={{ transform: active ? 'scale(1.1)' : 'scale(1)' }}>
      <rect x="2" y="2" width="50" height="82" rx="2" fill={active ? "#fff" : "transparent"} stroke={active ? "#fff" : "#888"} strokeWidth="2"/>
      <rect x="6" y="6" width="42" height="56" fill={active ? "#000" : "#888"} />
    </svg>
  );
}

export function InstaxSquareIcon({ size = 24, active = false }: { size?: number, active?: boolean }) {
  return (
    <svg width={size * 1.15} height={size * 1.4} viewBox="0 0 72 86" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-200" style={{ transform: active ? 'scale(1.1)' : 'scale(1)' }}>
      <rect x="2" y="2" width="68" height="82" rx="2" fill={active ? "#fff" : "transparent"} stroke={active ? "#fff" : "#888"} strokeWidth="2"/>
      <rect x="6" y="6" width="60" height="60" fill={active ? "#000" : "#888"} />
    </svg>
  );
}

export function InstaxWideIcon({ size = 24, active = false }: { size?: number, active?: boolean }) {
  return (
    <svg width={size * 1.4} height={size} viewBox="0 0 86 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-200" style={{ transform: active ? 'scale(1.1)' : 'scale(1)' }}>
      <rect x="2" y="2" width="82" height="60" rx="2" fill={active ? "#fff" : "transparent"} stroke={active ? "#fff" : "#888"} strokeWidth="2"/>
      <rect x="6" y="6" width="74" height="42" fill={active ? "#000" : "#888"} />
    </svg>
  );
}

export function Polaroid600Icon({ size = 24, active = false }: { size?: number, active?: boolean }) {
  return (
    <svg width={size * 1.15} height={size * 1.4} viewBox="0 0 88 107" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-200" style={{ transform: active ? 'scale(1.1)' : 'scale(1)' }}>
      <rect x="2" y="2" width="84" height="103" rx="2" fill={active ? "#fff" : "transparent"} stroke={active ? "#fff" : "#888"} strokeWidth="2"/>
      <rect x="6" y="6" width="76" height="76" fill={active ? "#000" : "#888"} />
    </svg>
  );
}
