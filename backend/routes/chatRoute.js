import express from "express";
import { handleAIChat } from "../controllers/chatController.js";

const router = express.Router();

// This defines the endpoint: POST http://localhost:5000/api/chat/ai-search
router.post("/ai-search", handleAIChat);

export default router;