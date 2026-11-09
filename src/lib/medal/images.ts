function drawToJpeg(file: File, maxEdge: number, quality: number) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Gambar tidak bisa diproses."));
        return;
      }
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak terbaca. Gunakan JPG, PNG, atau WebP."));
    };
    image.src = url;
  });
}

export async function compressImage(file: File, maxEdge: number, quality: number, limit: number) {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  const first = await drawToJpeg(file, maxEdge, quality);
  if (first.length <= limit) return first;
  const second = await drawToJpeg(file, Math.round(maxEdge * 0.72), Math.max(0.55, quality - 0.18));
  if (second.length <= limit) return second;
  throw new Error("Gambar masih terlalu besar. Pilih file yang lebih ringan.");
}
