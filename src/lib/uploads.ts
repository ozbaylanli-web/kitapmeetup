export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2MB — sunucu kodunda kontrol; storage bucket'larda da ayni limit var (bkz. 0013 göçü).

/** Bir dosyanın boyutu limiti aşıyorsa kullanıcıya gösterilecek hata metnini döner, aksi halde null. */
export function checkUploadSize(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return `Dosya çok büyük (${(file.size / (1024 * 1024)).toFixed(1)}MB). En fazla 2MB yükleyebilirsin.`;
  }
  return null;
}
