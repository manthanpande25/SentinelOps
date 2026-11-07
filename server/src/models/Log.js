
import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true
    },

    level: {
      type: String,
      enum: ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"],
      required: true,
      default: "INFO"
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000
    },

    errorType: {
      type: String,
      default: null
    },

    stackTrace: {
      type: String,
      default: null,
      maxlength: 20000
    },

    source: {
      type: String,
      default: null
    },

    request: {
      method: { type: String, default: null },
      url: { type: String, default: null },
      statusCode: { type: Number, default: null }
    },

    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Optimize log filtering and sorting
logSchema.index({ applicationId: 1, timestamp: -1 });
logSchema.index({ applicationId: 1, level: 1, timestamp: -1 });

const Log = mongoose.model("Log", logSchema);

export default Log;
