
import express from "express";

import {
  getIncidents,
  getIncidentById,
  updateIncidentStatus
} from "../controllers/incidentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getIncidents);
router.get("/:id", getIncidentById);
router.patch("/:id/status", updateIncidentStatus);

export default router;
