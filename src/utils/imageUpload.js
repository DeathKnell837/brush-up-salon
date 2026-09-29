/**
 * Compress an image file client-side using canvas and return a base64 data URL.
 * This keeps images small enough for localStorage (~5MB limit) and
 * Firestore documents (~1MB limit) without needing Firebase Storage.
 *
 * @param {File}   file                   – The image file to compress
 * @param {object} [opts]                 – Compression options
 * @param {number} [opts.maxWidth=800]    – Max width in pixels
 * @param {number} [opts.maxHeight=800]   – Max height in pixels
 * @param {number} [opts.quality=0.6]     – JPEG quality 0-1
 * @param {number} [opts.maxSizeMB=5]     – Reject files larger than this before compression
 * @returns {Promise<string>}             – Compressed base64 data URL
 */
export const compressImageToBase64 = (file, opts = {}) => {
  const { maxWidth = 800, maxHeight = 800, quality = 0.6, maxSizeMB = 5 } = opts;

  return new Promise((resolve, reject) => {
    // Validate
    if (!file) { reject(new Error('No file selected.')); return; }
    if (!file.type?.startsWith('image/')) { reject(new Error('Only image files are allowed.')); return; }
    if (file.size > maxSizeMB * 1024 * 1024) {
      reject(new Error(`File too large. Maximum size is ${maxSizeMB}MB.`));
      return;
    }

    // If file is tiny (< 50KB), just read it as-is — no need to compress
    if (file.size < 50 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if larger than max dimensions, keep aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image.'));
    };

    img.src = url;
  });
};
