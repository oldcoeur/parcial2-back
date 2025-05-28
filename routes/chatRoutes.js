import express from 'express';
import { generateChatResponse, getConversationHistory } from '../controllers/chatController.js';

const router = express.Router();

// Ruta principal de chat fitness CBUM
router.post('/', generateChatResponse);

// Ruta para historial de conversaciones por usuario
router.get('/chat/history', getConversationHistory);

export default router;
