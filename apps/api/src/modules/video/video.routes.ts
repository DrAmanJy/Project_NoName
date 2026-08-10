import { Router } from 'express';
import { videoController } from './video.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/uploads', (req, res, next) => { videoController.createUpload(req, res, next).catch(next); });
router.post('/uploads/:uploadId/sign-parts', (req, res, next) => { videoController.signParts(req, res, next).catch(next); });
router.post('/uploads/:uploadId/complete', (req, res, next) => { videoController.completeUpload(req, res, next).catch(next); });
router.get('/:uploadId', (req, res, next) => { videoController.getUploadStatus(req, res, next).catch(next); });
router.get('/:uploadId/verification', (req, res, next) => { videoController.getVerificationStatus(req, res, next).catch(next); });

export const videoRoutes = router;
