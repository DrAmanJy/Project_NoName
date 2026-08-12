import { Router } from 'express';
import { submissionsController } from './submissions.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/', (req, res, next) => { submissionsController.createSubmission(req, res, next).catch(next); });
router.get('/', (req, res, next) => { submissionsController.getSubmissions(req, res, next).catch(next); });
router.get('/:id', (req, res, next) => { submissionsController.getSubmissionById(req, res, next).catch(next); });

export const submissionsRoutes = router;
