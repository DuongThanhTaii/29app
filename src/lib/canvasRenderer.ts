import { FilmType, FrameRatio } from '@/types';
import { FILM_FILTERS, FRAME_RATIOS, POLAROID_BORDER } from './filmFilters';

function parseCSSFilter(filter: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (filter === 'none') return result;
  const parts = filter.match(/(\w+)\(([^)]+)\)/g) || [];
  parts.forEach(part => {
    const match = part.match(/(\w+)\(([^)]+)\)/);
    if (match) result[match[1]] = match[2];
  });
  return result;
}

function applyCanvasFilter(
  ctx: CanvasRenderingContext2D,
  filter: string
): void {
  ctx.filter = filter;
}

function addGrain(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  intensity: number = 0.03
): void {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity * 255;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, x, y);
}

export interface RenderOptions {
  filmType: FilmType;
  frameRatio: FrameRatio;
  caption?: string;
  captionColor?: string;
}

export function renderPolaroid(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | HTMLVideoElement,
  options: RenderOptions
): void {
  const dpr = window.devicePixelRatio || 1;
  const { w, h } = FRAME_RATIOS[options.frameRatio];
  const { sides, top, bottom } = POLAROID_BORDER;

  const totalW = w + sides * 2;
  const totalH = h + top + bottom;

  // HiDPI
  canvas.width = totalW * dpr;
  canvas.height = totalH * dpr;
  canvas.style.width = `${totalW}px`;
  canvas.style.height = `${totalH}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  // White polaroid background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalW, totalH);

  // Apply film filter and draw photo
  ctx.filter = FILM_FILTERS[options.filmType];
  ctx.drawImage(image, sides, top, w, h);
  ctx.filter = 'none';

  // Film grain
  try {
    addGrain(ctx, sides, top, w, h, 0.025);
  } catch {
    // Ignore CORS errors in dev
  }

  // Caption
  if (options.caption && options.caption.trim()) {
    const captionY = h + top + bottom / 2 + 10;
    ctx.save();
    ctx.font = `italic 28px 'Be Vietnam Pro', cursive`;
    ctx.fillStyle = options.captionColor || '#1d1c17';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(totalW / 2, captionY);
    ctx.rotate((Math.random() - 0.5) * 0.03);
    ctx.fillText(options.caption.slice(0, 30), 0, 0);
    ctx.restore();
  }

  // Border
  ctx.strokeStyle = '#e0d5c5';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, totalW - 1, totalH - 1);
}

export function renderPolaroidPreview(
  canvas: HTMLCanvasElement,
  imageDataUrl: string,
  options: RenderOptions,
  onComplete?: () => void
): void {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    renderPolaroid(canvas, img, options);
    onComplete?.();
  };
  img.src = imageDataUrl;
}

export function exportPolaroid(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Không thể xuất ảnh'));
      },
      'image/webp',
      0.85
    );
  });
}

export function exportStoryFormat(polaroidCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const storyCanvas = document.createElement('canvas');
  storyCanvas.width = 1080;
  storyCanvas.height = 1920;
  const ctx = storyCanvas.getContext('2d')!;

  // Dark gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, 1920);
  grad.addColorStop(0, '#1d1c17');
  grad.addColorStop(1, '#32302b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Polaroid centered
  const scale = Math.min(
    (1080 * 0.85) / polaroidCanvas.width,
    (1920 * 0.75) / polaroidCanvas.height
  );
  const dw = polaroidCanvas.width * scale;
  const dh = polaroidCanvas.height * scale;
  const dx = (1080 - dw) / 2;
  const dy = (1920 - dh) / 2 - 40;

  // Subtle shadow
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 40;
  ctx.drawImage(polaroidCanvas, dx, dy, dw, dh);
  ctx.shadowBlur = 0;

  // Brand watermark
  ctx.font = "500 18px 'JetBrains Mono', monospace";
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.textAlign = 'center';
  ctx.fillText('POLAROID CÁCH MẠNG', 1080 / 2, 1880);

  return storyCanvas;
}
