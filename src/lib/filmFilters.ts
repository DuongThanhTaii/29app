import { FilmType, FrameRatio } from '@/types';

export const FILM_FILTERS: Record<FilmType, string> = {
  original: 'none',
  kodak: 'sepia(0.3) contrast(1.15) saturate(1.2) brightness(1.05)',
  fuji: 'contrast(1.1) saturate(1.1) brightness(1.02) hue-rotate(-5deg)',
  polaroid: 'sepia(0.5) contrast(1.2) saturate(0.9) brightness(0.98)',
  ilford: 'grayscale(1) contrast(1.3) brightness(1.05)',
} as const;

export const FILM_NAMES: Record<FilmType, string> = {
  original: 'Original',
  kodak: 'Kodak Gold',
  fuji: 'Fuji Superia',
  polaroid: 'Polaroid 600',
  ilford: 'Ilford B&W',
} as const;

export const FRAME_RATIOS: Record<FrameRatio, { w: number; h: number; css: string; label: string }> = {
  '3:4': { w: 900, h: 1200, css: 'aspect-[3/4]', label: '3:4' },
  '1:1': { w: 900, h: 900, css: 'aspect-square', label: '1:1' },
  '16:9': { w: 900, h: 506, css: 'aspect-video', label: '16:9' },
} as const;

export const POLAROID_BORDER = {
  sides: 60,   // left & right
  top: 60,     // top
  bottom: 120, // bottom (caption area)
} as const;

export const CAPTION_COLORS = [
  { label: 'Đen', value: '#1d1c17' },
  { label: 'Trắng', value: '#ffffff' },
  { label: 'Đỏ', value: '#b71032' },
  { label: 'Vàng', value: '#cca730' },
] as const;
