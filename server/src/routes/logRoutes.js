import express from "express";
import {
  ingestLog,
  getLogs,
  getLogStats
} from "../controllers/logController.js";

import { verifyApiKey } from "../middleware/apiKeyMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/ingest", verifyApiKey, ingestLog);
router.get("/stats", protect, getLogStats);
router.get("/", protect, getLogs);


export default router;