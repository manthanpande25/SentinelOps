import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    // Application owner
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // Application details
    name: {
      type: String,
      required: true,
      trim: true
    },

    environment: {
      type: String,
      enum: ["development", "staging", "production"],
      default: "development"
    },

    technology: {
      type: String,
      required: true,
      trim: true
    },

    // Store only the hashed API key
    apiKeyHash: {
      type: String,
      required: true,
      select: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Application = mongoose.model(
  "Application",
  applicationSchema
);

export default Application;