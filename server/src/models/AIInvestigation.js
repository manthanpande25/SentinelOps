
import mongoose from "mongoose";

const aiInvestigationSchema = new mongoose.Schema(
  {
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      required: true,
      index: true
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true
    },

    model: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING"
    },

    summary: {
      type: String,
      default: ""
    },

    possibleCauses: [
      {
        cause: String,
        explanation: String,
        confidence: {
          type: Number,
          min: 0,
          max: 100
        }
      }
    ],

    evidence: [
      {
        logId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Log"
        },
        observation: String
      }
    ],

    recommendations: [
      {
        step: String,
        description: String
      }
    ],

    processingTime: {
      type: Number,
      default: 0
    },

    errorMessage: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

aiInvestigationSchema.index({
  incidentId: 1,
  createdAt: -1
});

const AIInvestigation = mongoose.model(
  "AIInvestigation",
  aiInvestigationSchema
);

export default AIInvestigation;
