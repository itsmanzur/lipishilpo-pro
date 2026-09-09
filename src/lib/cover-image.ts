const MAX_EDGE = 1800;
const MAX_INPUT_BYTES = 8 * 1024 * 1024;

export function isCoverDataUrl(value: string | undefined): boolean {
  return Boolean(value && /^data:image\/(jpeg|jpg|png);base64,/i.test(value));
}

export function compressCoverFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_INPUT_BYTES) {
      reject(new Error('ছবি ৮ MB-এর বেশি। ছোট করে আবার দিন।'));
      return;
    }
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
      reject(new Error('JPG, PNG বা WebP দিন।'));
      return;
    }
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > MAX_EDGE || h > MAX_EDGE) {
        const scale = Math.min(MAX_EDGE / w, MAX_EDGE / h);
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        reject(new Error('ছবি প্রস্তুত করা যায়নি।'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(blobUrl);
      resolve(canvas.toDataURL('image/jpeg', 0.84));
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error('ছবি পড়া যায়নি।'));
    };
    img.src = blobUrl;
  });
}
