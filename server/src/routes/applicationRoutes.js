import express from "express";

import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication
} from "../controllers/applicationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All application routes require authentication
router.use(protect);

// Create application
router.post("/", createApplication);
router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

export default router;