const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "pothole",
        "streetlight",
        "garbage",
        "water",
        "sewage",
        "traffic",
        "parks",
        "other",
      ],
    },

    // GEOJSON
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      address: { type: String, required: true },
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "under-review",
        "in-progress",
        "pending-verification",
        "resolved",
        "rejected",
      ],
      default: "pending",
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    images: [
      {
        url: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    votes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: ["up", "down"] },
        votedAt: { type: Date, default: Date.now },
      },
    ],

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        isEdited: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ⭐ NEW FEATURES
    resolutionNotes: String,
    resolutionProof: String, // Uploaded file URL

    actualResolutionTime: Date,
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

issueSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Issue", issueSchema);
