
import mongoose from "mongoose";
import Application from "../models/Application.js";
import Incident from "../models/Incident.js";
import AIInvestigation from "../models/AIInvestigation.js";
import { investigateIncident } from "../services/aiService.js";

// Trigger AI investigation
export const startInvestigation = async (req, res) => {
  try {
    const { incidentId } = req.params;

    if (!mongoose.isValidObjectId(incidentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID."
      });
    }

    // Find applications owned by the logged-in user
    const applications = await Application.find({
      userId: req.userId
    }).select("_id");

    const applicationIds = applications.map(app => app._id);

    // Verify incident ownership
    const incident = await Incident.findOne({
      _id: incidentId,
      applicationId: { $in: applicationIds }
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found."
      });
    }

    // Prevent duplicate concurrent investigations
    const existingInvestigation = await AIInvestigation.findOne({
      incidentId: incident._id,
      status: { $in: ["PENDING", "PROCESSING"] }
    });

    if (existingInvestigation) {
      return res.status(409).json({
        success: false,
        message: "Investigation is already in progress."
      });
    }

    // Return immediately; AI processing continues asynchronously
    res.status(202).json({
      success: true,
      message: "AI investigation started.",
      incidentId: incident._id
    });

    // Run AI investigation without blocking the HTTP response
    setImmediate(async () => {
      try {
        await investigateIncident(incident._id);
      } catch (error) {
        console.error("Background AI investigation failed:", error.message);
      }
    });

  } catch (error) {
    console.error("Start investigation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start AI investigation."
    });
  }
};

// Get latest investigation for an incident
export const getInvestigation = async (req, res) => {
  try {
    const { incidentId } = req.params;

    if (!mongoose.isValidObjectId(incidentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID."
      });
    }

    const applications = await Application.find({
      userId: req.userId
    }).select("_id");

    const applicationIds = applications.map(app => app._id);

    const incident = await Incident.findOne({
      _id: incidentId,
      applicationId: { $in: applicationIds }
    }).select("_id");

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found."
      });
    }

    const investigation = await AIInvestigation.findOne({
      incidentId: incident._id,
      applicationId: { $in: applicationIds }
    }).sort({ createdAt: -1 });

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: "No investigation found."
      });
    }

    return res.status(200).json({
      success: true,
      investigation
    });

  } catch (error) {
    console.error("Get investigation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch investigation."
    });
  }
};
