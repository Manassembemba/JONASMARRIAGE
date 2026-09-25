import { supabase } from '../lib/supabase';

/**
 * Image upload & compression utility
 * Compresses heavy photos and uploads directly to Supabase Storage
 */

export async function compressImage(file: File, maxDimension = 1920, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob failed'));
          },
          mimeType,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export async function uploadPhotoToServer(fileOrDataUrl: File | string, filenameHint = 'photo'): Promise<string> {
  try {
    let fileToUpload: File | Blob;
    let mimeType = 'image/jpeg';
    let ext = 'jpg';

    if (typeof fileOrDataUrl === 'string') {
      if (
        fileOrDataUrl.startsWith('http://') ||
        fileOrDataUrl.startsWith('https://') ||
        fileOrDataUrl.startsWith('/uploads/') ||
        fileOrDataUrl.startsWith('/assets/')
      ) {
        return fileOrDataUrl; // Already a URL
      }
      
      // Data URL fallback handling
      const matches = fileOrDataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
         mimeType = matches[1];
         ext = mimeType.split('/')[1] || 'jpg';
         
         const byteCharacters = atob(matches[2]);
         const byteNumbers = new Array(byteCharacters.length);
         for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         fileToUpload = new Blob([byteArray], { type: mimeType });
      } else {
        return fileOrDataUrl;
      }
    } else {
      fileToUpload = await compressImage(fileOrDataUrl);
      mimeType = fileOrDataUrl.type === 'image/png' ? 'image/png' : 'image/jpeg';
      ext = fileOrDataUrl.type === 'image/png' ? 'png' : 'jpg';
    }

    const cleanName = filenameHint.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'photo';
    const fileName = `${cleanName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('wedding-photos')
      .upload(fileName, fileToUpload, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('wedding-photos')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error during photo upload:', err);
    if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.readAsDataURL(fileOrDataUrl);
    });
  }
}

/**
 * Upload an audio file (mp3/wav/ogg) to Supabase Storage bucket "wedding-photos"
 * Returns a public persistent URL to use as musicUrl
 */
export async function uploadMusicToServer(file: File): Promise<string> {
  const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a'];
  if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|aac|m4a)$/i)) {
    throw new Error('Format audio non supporté. Utilisez mp3, wav, ogg ou aac.');
  }

  const ext = file.name.split('.').pop() || 'mp3';
  const fileName = `music_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

  const { error } = await supabase.storage
    .from('wedding-photos')
    .upload(fileName, file, {
      contentType: file.type || 'audio/mpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase music upload error:', error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('wedding-photos')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
