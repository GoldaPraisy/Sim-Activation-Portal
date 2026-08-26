import { Router } from 'express';
import PlanController from '../controllers/plan.controller.js';

const router = Router();

router.get('/', PlanController.getAllPlans);
router.get('/:id', PlanController.getPlanById);

export default router;
