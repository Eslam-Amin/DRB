const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    startLocation: {
      type: String,
      required: [true, "Start location is required"],
      trim: true,
      minlength: [2, "Start location must be at least 2 characters long"],
      maxlength: [100, "Start location cannot exceed 100 characters"]
    },
    endLocation: {
      type: String,
      required: [true, "End location is required"],
      trim: true,
      minlength: [2, "End location must be at least 2 characters long"],
      maxlength: [100, "End location cannot exceed 100 characters"]
    },
    distance: {
      type: Number,
      required: [true, "Distance is required"],
      min: [0.1, "Distance must be greater than 0"],
      max: [10000, "Distance cannot exceed 10000 km"]
    },
    estimatedTime: {
      type: Number,
      required: [true, "Estimated time is required"],
      min: [1, "Estimated time must be at least 1 minute"],
      max: [1440, "Estimated time cannot exceed 1440 minutes (24 hours)"]
    },
    status: {
      type: String,
      enum: ["unassigned", "assigned"],
      default: "unassigned"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model("Route", routeSchema);
