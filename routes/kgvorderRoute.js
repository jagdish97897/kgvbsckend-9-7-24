import express from 'express';
import { createKgvBikeOrder } from '../contollers/kgvbikeorderControler.js';

const router = express.Router();

router.post('/kgvbikeorder', createKgvBikeOrder);

export default router;
