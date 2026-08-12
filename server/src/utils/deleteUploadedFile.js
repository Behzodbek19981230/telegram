import fs from 'node:fs/promises';
import path from 'node:path';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

export async function deleteUploadedFileByUrl(mediaUrl) {
  if (!mediaUrl || !mediaUrl.startsWith('/uploads/')) return;

  const filename = path.basename(mediaUrl);
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Failed to delete uploaded file', filePath, err);
    }
  }
}
