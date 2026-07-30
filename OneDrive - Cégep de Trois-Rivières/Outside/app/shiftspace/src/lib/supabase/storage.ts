import { supabase } from './client';

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function isDataUrl(value: string): boolean {
  return !!value && value.startsWith('data:');
}

export async function uploadImageIfNeeded(
  value: string,
  path: string
): Promise<string> {
  if (!value || !isDataUrl(value)) {
    return value;
  }

  const blob = dataUrlToBlob(value);
  const ext = blob.type.split('/')[1] || 'jpg';
  const filePath = `${path}.${ext}`;

  const { error } = await supabase.storage
    .from('media')
    .upload(filePath, blob, { upsert: true, contentType: blob.type });

  if (error) {
    console.error('Failed to upload image', error);
    return value;
  }

  const { data } = supabase.storage.from('media').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadImagesInObject<T>(
  obj: T,
  basePath: string,
  imageKeys: string[] = ['avatar', 'bannerImage', 'image', 'coverImage', 'avatar_url', 'banner_url']
): Promise<T> {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    if (isDataUrl(obj)) {
      return (await uploadImageIfNeeded(obj, `${basePath}/${Date.now()}`)) as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    const results = await Promise.all(
      obj.map((item, index) => uploadImagesInObject(item, `${basePath}/${index}`, imageKeys))
    );
    return results as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'string' && isDataUrl(value) && (imageKeys.includes(key) || key.includes('image') || key.includes('Image') || key.includes('avatar') || key.includes('banner') || key.includes('cover'))) {
        result[key] = await uploadImageIfNeeded(value, `${basePath}/${key}-${Date.now()}`);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = await uploadImagesInObject(value, `${basePath}/${key}`, imageKeys);
      }
    }
    return result as T;
  }

  return obj;
}

export async function deleteUserMedia(userId: string): Promise<void> {
  const { data: files } = await supabase.storage.from('media').list(userId);
  if (files && files.length > 0) {
    await supabase.storage
      .from('media')
      .remove(files.map((f) => `${userId}/${f.name}`));
  }
}
