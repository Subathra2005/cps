import express from 'express';
import type { RequestHandler } from 'express';
import { login, signup } from '../controllers/authController.js';

const router = express.Router();

// POST /api/login
router.post('/login', login as RequestHandler);

// POST /api/signup
router.post('/signup', signup as RequestHandler);

export default router; 