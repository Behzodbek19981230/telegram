import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const duration = req.body.duration ? Number(req.body.duration) : null;

  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    originalName: req.file.originalname,
    size: req.file.size,
    duration: Number.isFinite(duration) ? Math.round(duration) : null,
  });
});
