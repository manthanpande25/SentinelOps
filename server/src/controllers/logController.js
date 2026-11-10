import Log from "../models/Log.js";
import Application from "../models/Application.js";
import { processLogForIncident } from "../services/detectionService.js";

export const ingestLog = async (req, res) => {
  try {
    const {
      level,
      message,
      errorType,
      stackTrace,
      source,
      request,
      timestamp,
    } = req.body;

    // Validate required fields
    const allowedLevels = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"];

    if (!level || !allowedLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: "Invalid log level.",
      });
    }

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid log message is required.",
      });
    }

    // Validate optional timestamp
    const logTimestamp =
      timestamp === undefined ? new Date() : new Date(timestamp);

    if (Number.isNaN(logTimestamp.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid timestamp.",
      });
    }

    // Store log in MongoDB
    const log = await Log.create({
      applicationId: req.applicationId,
      level,
      message: message.trim(),
      errorType,
      stackTrace,
      source,
      request,
      timestamp: logTimestamp,
    });

    // Automatically detect and create/update incidents
    let incident = null;

    try {
      incident = await processLogForIncident(log);
    } catch (detectionError) {
      console.error("Incident detection failed:", detectionError);
    }

    return res.status(201).json({
      success: true,
      message: "Log ingested successfully.",
      logId: log._id,
      incidentId: incident?._id || null,
    });

  } catch (error) {
    console.error("Log ingestion error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to ingest log.",
    });
  }
};

export const getLogs = async (req, res) => {
  try {
    const { level, search, page = 1, limit = 20 } = req.query;

    // Build query using authenticated user's applications
    const Application = (await import("../models/Application.js")).default;

    const applications = await Application.find({
      userId: req.userId,
    }).select("_id");

    const applicationIds = applications.map((app) => app._id);

    const filter = {
      applicationId: { $in: applicationIds },
    };

    // Filter by log level
    if (level) {
      const allowedLevels = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"];

      if (!allowedLevels.includes(level)) {
        return res.status(400).json({
          success: false,
          message: "Invalid log level.",
        });
      }

      filter.level = level;
    }

    // Search log messages
    if (search) {
      filter.message = {
        $regex: search,
        $options: "i",
      };
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

    const skip = (currentPage - 1) * pageSize;

    const [logs, total] = await Promise.all([
      Log.find(filter).sort({ timestamp: -1 }).skip(skip).limit(pageSize),

      Log.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
      logs,
    });
  } catch (error) {
    console.error("Get logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch logs.",
    });
  }
};

export const getLogStats = async (req, res) => {
  try {
    // Find applications owned by logged-in user
    const applications = await Application.find({
      userId: req.userId,
    }).select("_id");

    const applicationIds = applications.map((app) => app._id);

    // Group logs by severity
    const stats = await Log.aggregate([
      {
        $match: {
          applicationId: { $in: applicationIds },
        },
      },
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize all severity counts
    const result = {
      totalLogs: 0,
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      FATAL: 0,
    };

    // Fill counts from MongoDB results
    stats.forEach((item) => {
      result[item._id] = item.count;
      result.totalLogs += item.count;
    });

    return res.status(200).json({
      success: true,
      stats: result,
    });
  } catch (error) {
    console.error("Log statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch log statistics.",
    });
  }
};
