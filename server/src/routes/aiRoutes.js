

import express from "express";

import {
  startInvestigation,
  getInvestigation
} from "../controllers/aiController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/investigate/:incidentId", startInvestigation);

router.get("/investigations/:incidentId", getInvestigation);

export default router;
