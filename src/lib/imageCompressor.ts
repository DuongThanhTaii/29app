/**
 * Compress image to WebP format, max 500KB
 * Rule: always URL.revokeObjectURL after use
 */
export function compressImage(
  file: File | Blob,
  maxWidth: number = 1200
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const scale = Math.min(maxWidth / img.width, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Không thể nén ảnh'));
          }
        },
        'image/webp',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không thể đọc ảnh'));
    };

    img.src = url;
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];
  const MAX_SIZE_MB = 20; // before compression

  if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    return { valid: false, error: 'Chỉ hỗ trợ ảnh JPEG, PNG, WebP' };
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Ảnh quá lớn (tối đa ${MAX_SIZE_MB}MB)` };
  }

  return { valid: true };
}
