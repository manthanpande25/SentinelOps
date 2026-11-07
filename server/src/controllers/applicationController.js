import Application from "../models/Application.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Create a new application
export const createApplication = async (req, res) => {
  try {
    const { name, environment, technology } = req.body;

    // Validate required fields
    if (!name || !technology) {
      return res.status(400).json({
        success: false,
        message: "Application name and technology are required.",
      });
    }

    const apiKeyPrefix = crypto.randomBytes(8).toString("hex");

    const secret = crypto.randomBytes(32).toString("hex");

    const apiKey = `sentinel_${apiKeyPrefix}_${secret}`;

    const apiKeyHash = await bcrypt.hash(apiKey, 12);

    // Save application in MongoDB
    const application = await Application.create({
      userId: req.userId,
      name,
      environment,
      technology,
      apiKeyPrefix,
      apiKeyHash,
    });
    // Send API key only once
    res.status(201).json({
      success: true,
      message: "Application created successfully.",
      application: {
        id: application._id,
        name: application.name,
        environment: application.environment,
        technology: application.technology,
        isActive: application.isActive,
        createdAt: application.createdAt,
      },
      apiKey,
    });
  } catch (error) {
    console.error("Create application error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create application.",
    });
  }
};

// Get all applications belonging to the logged-in user
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      userId: req.userId,
    })
      .select("-apiKeyHash")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get applications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch applications.",
    });
  }
};

// Get a single application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get application error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch application.",
    });
  }
};

// Update an application
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, environment, technology } = req.body;

    // Allow only specific fields to be updated
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (environment !== undefined) updates.environment = environment;
    if (technology !== undefined) updates.technology = technology;

    // Prevent empty updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    // Update application
    const application = await Application.findOneAndUpdate(
      {
        _id: id,
        userId: req.userId,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application updated successfully.",
      application,
    });
  } catch (error) {
    console.error("Update application error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update application.",
    });
  }
};

// Delete an application
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application deleted successfully.",
    });
  } catch (error) {
    console.error("Delete application error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete application.",
    });
  }
};

// Rotate application API key
export const rotateApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKeyPrefix = crypto.randomBytes(8).toString("hex");

    const secret = crypto.randomBytes(32).toString("hex");

    const apiKey = `sentinel_${apiKeyPrefix}_${secret}`;

    const apiKeyHash = await bcrypt.hash(apiKey, 12);

    // Replace the existing API key hash
    const application = await Application.findOneAndUpdate(
      {
        _id: id,
        userId: req.userId,
      },
      {
        $set: {
          apiKeyHash,
          apiKeyPrefix,
        },
      },
      {
        new: true,
      },
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "API key rotated successfully.",
      apiKey,
    });
  } catch (error) {
    console.error("API key rotation error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to rotate API key.",
    });
  }
};
