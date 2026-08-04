import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { upload } from '../middleware/upload.js';
import { uploadFile } from '../controllers/upload.controller.js';

const router = Router();

router.post('/', requireAuth, upload.single('file'), uploadFile);

export default router;
