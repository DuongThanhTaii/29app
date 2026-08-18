import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

// 1. Digital / iPhone
export const DigitalIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="5" y="5" width="30" height="30" rx="6" fill="#1C1C1E" stroke="#48484A" strokeWidth="1.5" />
    <rect x="8" y="8" width="14" height="14" rx="4" fill="#2C2C2E" />
    <circle cx="11.5" cy="11.5" r="2.5" fill="#000000" stroke="#3A3A3C" strokeWidth="0.5" />
    <circle cx="18.5" cy="18.5" r="2.5" fill="#000000" stroke="#3A3A3C" strokeWidth="0.5" />
    <circle cx="11.5" cy="18.5" r="2.5" fill="#000000" stroke="#3A3A3C" strokeWidth="0.5" />
    <circle cx="18.5" cy="11.5" r="1.5" fill="#F4F4F5" />
  </svg>
);

// 2. Kodak Ektar H35 (Bright Yellow Half-Frame)
export const KodakIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="2" y="8" width="36" height="24" rx="3" fill="#F2C200" />
    <rect x="2" y="10" width="36" height="20" fill="#1A1A1A" />
    <rect x="25" y="10" width="13" height="20" fill="#F2C200" />
    <circle cx="16" cy="20" r="7" fill="#262626" stroke="#404040" strokeWidth="1.5" />
    <circle cx="16" cy="20" r="3" fill="#000" />
    <rect x="28" y="12" width="6" height="4" rx="1" fill="#000" />
    <circle cx="31" cy="24" r="2" fill="#E53935" />
  </svg>
);

// 3. Fujifilm X100V (Silver & Black Leather)
export const FujiIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="2" y="10" width="36" height="22" rx="2" fill="#D4D4D4" />
    <rect x="2" y="16" width="36" height="16" rx="2" fill="#1A1A1A" />
    <circle cx="20" cy="22" r="9" fill="#1A1A1A" stroke="#E5E5E5" strokeWidth="2" />
    <circle cx="20" cy="22" r="4" fill="#000" />
    <circle cx="20" cy="22" r="1" fill="#404040" />
    <rect x="28" y="11" width="5" height="3" rx="1" fill="#1A1A1A" />
    <circle cx="7" cy="12" r="1.5" fill="#1A1A1A" />
  </svg>
);

// 4. Polaroid Now (White & Rainbow)
export const PolaroidIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M4 14C4 10.6863 6.68629 8 10 8H30C33.3137 8 36 10.6863 36 14V32H4V14Z" fill="#F5F5F5" />
    <path d="M2 28C2 26.8954 2.89543 26 4 26H36C37.1046 26 38 26.8954 38 28V33C38 34.1046 37.1046 35 36 35H4C2.89543 35 2 34.1046 2 33V28Z" fill="#E5E5E5" />
    <circle cx="20" cy="19" r="6" fill="#1A1A1A" stroke="#CCCCCC" strokeWidth="1.5" />
    <circle cx="20" cy="19" r="2.5" fill="#000" />
    <rect x="28" y="11" width="4" height="3" rx="1" fill="#1A1A1A" />
    <rect x="18" y="26" width="1" height="9" fill="#E53935" />
    <rect x="19" y="26" width="1" height="9" fill="#F0A500" />
    <rect x="20" y="26" width="1" height="9" fill="#4CAF50" />
    <rect x="21" y="26" width="1" height="9" fill="#2196F3" />
  </svg>
);

// 5. Leica M6 (Ilford B&W)
export const LeicaIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="3" y="10" width="34" height="20" rx="2" fill="#1A1A1A" />
    <rect x="3" y="10" width="34" height="6" fill="#262626" />
    <circle cx="20" cy="20" r="8" fill="#1A1A1A" stroke="#404040" strokeWidth="2" />
    <circle cx="20" cy="20" r="4" fill="#000" />
    <circle cx="11" cy="13" r="2" fill="#E53935" />
    <rect x="26" y="12" width="6" height="3" rx="1" fill="#000" />
    <rect x="31" y="8" width="4" height="2" rx="1" fill="#404040" />
  </svg>
);
