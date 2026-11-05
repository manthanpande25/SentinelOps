
import mongoose from "mongoose";

export const checkHealth = (req, res) => {
  const databaseStatus =
    mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";

  res.status(200).json({
    success: true,
    service: "SentinelOps API",
    status: "running",
    database: databaseStatus,
    timestamp: new Date().toISOString()
  });
};
