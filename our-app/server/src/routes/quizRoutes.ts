import express from 'express';
import type { RequestHandler } from 'express';
import {
    getAllQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizzesByLang,
    getQuizzesByLevel,
    getQuizzesByTopic,
    getQuizzesByLangAndLevel,
    getQuizzesByLangAndTopic,
    getQuizzesByLevelAndTopic,
    getQuizzesByLangLevelAndTopic,
    searchQuizzes,
    debugQuizzes,
    getQuizReview,
    editQuizzesByLangLevelTopic,
    submitQuizzesByLangLevelTopic,
    deleteQuizzesByLangLevelTopic
} from '../controllers/quizController.js';

const router = express.Router();

// GET /api/quizzes
router.get('/', getAllQuizzes as RequestHandler);

// GET /api/quizzes/debug - Debug endpoint to check database state
router.get('/debug', debugQuizzes as RequestHandler);

// GET /api/quizzes/search - Advanced search with query parameters
router.get('/search', searchQuizzes as RequestHandler);

// GET /api/quizzes/lang/:lang
router.get('/lang/:lang', getQuizzesByLang as RequestHandler);

// GET /api/quizzes/level/:level
router.get('/level/:level', getQuizzesByLevel as RequestHandler);

// GET /api/quizzes/topic/:topic
router.get('/topic/:topic', getQuizzesByTopic as RequestHandler);

// GET /api/quizzes/lang/:lang/level/:level
router.get('/lang/:lang/level/:level', getQuizzesByLangAndLevel as RequestHandler);

// GET /api/quizzes/lang/:lang/topic/:topic
router.get('/lang/:lang/topic/:topic', getQuizzesByLangAndTopic as RequestHandler);

// GET /api/quizzes/level/:level/topic/:topic
router.get('/level/:level/topic/:topic', getQuizzesByLevelAndTopic as RequestHandler);

// GET /api/quizzes/lang/:lang/level/:level/topic/:topic
router.get('/lang/:lang/level/:level/topic/:topic', getQuizzesByLangLevelAndTopic as RequestHandler);

// GET /api/quizzes/:id/review?userId=...
router.get('/:id/review', getQuizReview as RequestHandler);

// GET /api/quizzes/:id
router.get('/:id', getQuizById as RequestHandler);

// POST /api/quizzes
router.post('/', createQuiz as RequestHandler);

// PUT /api/quizzes/:id
router.put('/:id', updateQuiz as RequestHandler);

// DELETE /api/quizzes/:id
router.delete('/:id', deleteQuiz as RequestHandler);

// ADMIN-ONLY ENDPOINTS (No authentication required)

// PUT /api/quizzes/lang/:lang/level/:level/topic/:topic/edit
router.put('/lang/:lang/level/:level/topic/:topic/edit', editQuizzesByLangLevelTopic as RequestHandler);

// POST /api/quizzes/lang/:lang/level/:level/topic/:topic/submit
router.post('/lang/:lang/level/:level/topic/:topic/submit', submitQuizzesByLangLevelTopic as RequestHandler);

// DELETE /api/quizzes/lang/:lang/level/:level/topic/:topic/delete
router.delete('/lang/:lang/level/:level/topic/:topic/delete', deleteQuizzesByLangLevelTopic as RequestHandler);

export default router; 