import crypto from 'node:crypto';
import path from 'node:path';
import multer from 'multer';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 20);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
});
