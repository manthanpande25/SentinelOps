
import mongoose from "mongoose";
import Incident from "../models/Incident.js";
import Application from "../models/Application.js";

// Get all incidents belonging to the logged-in user
export const getIncidents = async (req, res) => {
  try {
    const applications = await Application.find({
      userId: req.userId
    }).select("_id");

    const applicationIds = applications.map(app => app._id);

    const incidents = await Incident.find({
      applicationId: { $in: applicationIds }
    }).sort({ lastSeen: -1 });

    return res.status(200).json({
      success: true,
      total: incidents.length,
      incidents
    });
  } catch (error) {
    console.error("Get incidents error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch incidents."
    });
  }
};

// Get a single incident with its related logs
export const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
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
      _id: id,
      applicationId: { $in: applicationIds }
    }).populate("relatedLogIds");

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found."
      });
    }

    return res.status(200).json({
      success: true,
      incident
    });
  } catch (error) {
    console.error("Get incident error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch incident."
    });
  }
};

// Update incident status
export const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "OPEN",
      "INVESTIGATING",
      "RESOLVED",
      "IGNORED"
    ];

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID."
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident status."
      });
    }

    const applications = await Application.find({
      userId: req.userId
    }).select("_id");

    const applicationIds = applications.map(app => app._id);

    const incident = await Incident.findOneAndUpdate(
      {
        _id: id,
        applicationId: { $in: applicationIds }
      },
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Incident status updated successfully.",
      incident
    });
  } catch (error) {
    console.error("Update incident status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update incident status."
    });
  }
};
