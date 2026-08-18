import { FilmType, FrameType } from '@/types';

export const FILM_FILTERS: Record<FilmType, string> = {
  original: 'none',
  kodak: 'sepia(0.3) contrast(1.15) saturate(1.2) brightness(1.05)',
  fuji: 'contrast(1.1) saturate(1.1) brightness(1.02) hue-rotate(-5deg)',
  polaroid: 'sepia(0.5) contrast(1.2) saturate(0.9) brightness(0.98)',
  ilford: 'grayscale(1) contrast(1.3) brightness(1.05)',
} as const;

export const FILM_NAMES: Record<FilmType, string> = {
  original: 'Digital',
  kodak: 'Kodak Ektar H35',
  fuji: 'Fujifilm X100V',
  polaroid: 'Polaroid Now',
  ilford: 'Leica M6',
} as const;

export const FRAME_TYPES: Record<FrameType, { w: number; h: number; css: string; label: string; sides: number; top: number; bottom: number }> = {
  'instax-mini': { w: 900, h: 1200, css: 'aspect-[3/4]', label: 'Instax Mini', sides: 60, top: 60, bottom: 200 },
  'instax-square': { w: 900, h: 900, css: 'aspect-square', label: 'Instax Square', sides: 60, top: 60, bottom: 180 },
  'instax-wide': { w: 1200, h: 900, css: 'aspect-[4/3]', label: 'Instax Wide', sides: 80, top: 60, bottom: 160 },
  'polaroid-600': { w: 900, h: 900, css: 'aspect-square', label: 'Polaroid 600', sides: 40, top: 40, bottom: 220 },
} as const;

export const INSTAX_COLORS = [
  { label: 'Classic White', value: '#FBFBF8' },
  { label: 'Matte Black', value: '#1A1A1A' },
  { label: 'Macaron Blue', value: '#AEC6CF' },
  { label: 'Macaron Pink', value: '#FCD3DB' },
  { label: 'Macaron Yellow', value: '#FDFD96' },
  { label: 'Mint Green', value: '#C1E1C1' },
] as const;

export const CAPTION_COLORS = [
  { label: 'Đen', value: '#1d1c17' },
  { label: 'Trắng', value: '#ffffff' },
  { label: 'Đỏ', value: '#b71032' },
  { label: 'Vàng', value: '#cca730' },
] as const;
