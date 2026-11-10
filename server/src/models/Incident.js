
import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true
    },

    fingerprint: {
      type: String,
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    errorType: {
      type: String,
      default: "UnknownError"
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM"
    },

    status: {
      type: String,
      enum: ["OPEN", "INVESTIGATING", "RESOLVED", "IGNORED"],
      default: "OPEN"
    },

    occurrenceCount: {
      type: Number,
      default: 1
    },

    firstSeen: {
      type: Date,
      default: Date.now
    },

    lastSeen: {
      type: Date,
      default: Date.now
    },

    relatedLogIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Log"
      }
    ]
  },
  {
    timestamps: true
  }
);

// Find incidents belonging to an application
incidentSchema.index({
  applicationId: 1,
  lastSeen: -1
});

// Prevent duplicate active incidents for the same error
incidentSchema.index(
  {
    applicationId: 1,
    fingerprint: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["OPEN", "INVESTIGATING"] }
    }
  }
);

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;
