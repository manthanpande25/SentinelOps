
import crypto from "crypto";
import Incident from "../models/Incident.js";

const generateFingerprint = (log) => {
  // Normalize the message so whitespace differences don't create new incidents
  const normalizedMessage = log.message
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const errorType = log.errorType || "UnknownError";

  const fingerprintSource = `${errorType}:${normalizedMessage}`;

  return crypto
    .createHash("sha256")
    .update(fingerprintSource)
    .digest("hex");
};

export const processLogForIncident = async (log) => {
  // Only ERROR and FATAL logs should create incidents
  if (!["ERROR", "FATAL"].includes(log.level)) {
    return null;
  }

  const fingerprint = generateFingerprint(log);

  const severity = log.level === "FATAL" ? "CRITICAL" : "HIGH";

  const incidentFilter = {
    applicationId: log.applicationId,
    fingerprint,
    status: { $in: ["OPEN", "INVESTIGATING"] }
  };

  // Update an existing active incident
  const updateExistingIncident = () =>
    Incident.findOneAndUpdate(
      incidentFilter,
      {
        $inc: { occurrenceCount: 1 },
        $set: { lastSeen: log.timestamp },
        $push: {
          relatedLogIds: {
            $each: [log._id],
            $slice: -100
          }
        }
      },
      { new: true }
    );

  try {
    let incident = await updateExistingIncident();

    if (incident) {
      return incident;
    }

    // No active incident found: create a new one
    incident = await Incident.create({
      applicationId: log.applicationId,
      fingerprint,
      title: `${log.errorType || "UnknownError"}: ${log.message}`,
      errorType: log.errorType || "UnknownError",
      severity,
      status: "OPEN",
      occurrenceCount: 1,
      firstSeen: log.timestamp,
      lastSeen: log.timestamp,
      relatedLogIds: [log._id]
    });

    return incident;

  } catch (error) {
    // Another request may have created the same incident simultaneously
    if (error.code === 11000) {
      const incident = await updateExistingIncident();

      if (incident) {
        return incident;
      }
    }

    throw error;
  }
};
