/**
 * Cloudinary unsigned upload — replaces Firebase Storage (requires Blaze plan).
 * Free tier: 25 credits/month, no credit card needed.
 * Setup: cloudinary.com → sign up → Dashboard → Settings → Upload → Upload presets → Add unsigned preset
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

export async function uploadImageToCloudinary(
  blob: Blob,
  folder: string = 'polaroid'
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET vào .env.local');
  }

  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);
  formData.append('quality', 'auto:good');
  formData.append('fetch_format', 'auto');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Tải ảnh lên thất bại');
  }

  const data = await res.json();
  // Return secure_url — works without Firebase Storage
  return data.secure_url as string;
}

export async function uploadAvatarToCloudinary(blob: Blob, userId: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary chưa được cấu hình');
  }

  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'polaroid/avatars');
  formData.append('public_id', `avatar_${userId}`);
  formData.append('overwrite', 'true');
  formData.append('transformation', 'c_fill,w_400,h_400,q_auto');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    throw new Error('Tải ảnh đại diện lên thất bại');
  }

  const data = await res.json();
  return data.secure_url as string;
}
