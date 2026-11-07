
import bcrypt from "bcryptjs";
import Application from "../models/Application.js";

export const verifyApiKey = async (req, res, next) => {
  try {
    // Get API key from request headers
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key is missing."
      });
    }

    // Validate API key structure
    const parts = apiKey.split("_");

    if (
      parts.length !== 3 ||
      parts[0] !== "sentinel" ||
      !/^[a-f0-9]{16}$/.test(parts[1]) ||
      !/^[a-f0-9]{64}$/.test(parts[2])
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key."
      });
    }

    const apiKeyPrefix = parts[1];

    // Find application using public API key prefix
    const application = await Application.findOne({
      apiKeyPrefix,
      isActive: true
    }).select("+apiKeyHash");

    if (!application) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive API key."
      });
    }

    // Compare provided key with stored bcrypt hash
    const isValid = await bcrypt.compare(
      apiKey,
      application.apiKeyHash
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key."
      });
    }

    // Attach authenticated application to request
    req.applicationId = application._id;
    req.application = application;

    next();

  } catch (error) {
    console.error("API key verification error:", error);

    return res.status(500).json({
      success: false,
      message: "API key verification failed."
    });
  }
};
