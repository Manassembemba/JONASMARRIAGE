/**
 * Image upload & compression utility
 * Compresses heavy photos before uploading to /api/upload to guarantee fast,
 * persistent storage on disk and light SQLite database payloads.
 */

export async function compressImage(file: File, maxDimension = 1920, quality = 0.85): Promise<string> {
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
          resolve(event.target?.result as string);
          return;
        }

        // Use high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with 85% quality
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export async function uploadPhotoToServer(fileOrDataUrl: File | string, filenameHint = 'photo'): Promise<string> {
  try {
    let dataUrl: string;

    if (typeof fileOrDataUrl === 'string') {
      // If it's already an existing persistent upload or remote URL, return directly
      if (
        fileOrDataUrl.startsWith('http://') ||
        fileOrDataUrl.startsWith('https://') ||
        fileOrDataUrl.startsWith('/uploads/') ||
        fileOrDataUrl.startsWith('/assets/')
      ) {
        return fileOrDataUrl;
      }
      dataUrl = fileOrDataUrl;
    } else {
      // It's a File: compress it first
      dataUrl = await compressImage(fileOrDataUrl);
    }

    // Send to backend /api/upload
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataUrl,
        filename: filenameHint,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.url) {
        return json.url;
      }
    }

    // If server upload returned error, fallback to compressed data URL
    return dataUrl;
  } catch (err) {
    console.error('Error during photo upload:', err);
    if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
    return await compressImage(fileOrDataUrl);
  }
}
