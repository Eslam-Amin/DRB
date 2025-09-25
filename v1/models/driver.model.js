const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
      minlength: [2, "Driver name must be at least 2 characters long"],
      maxlength: [50, "Driver name cannot exceed 50 characters"]
    },
    licenseType: {
      type: String,
      required: [true, "License type is required"],
      enum: {
        values: ["A", "B", "C", "D"],
        message: "License type must be A, B, C, or D"
      }
    },
    availability: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for driver's current route
driverSchema.virtual("currentRoute", {
  ref: "Schedule",
  localField: "_id",
  foreignField: "driver",
  justOne: true,
  match: { status: "active" }
});

// Virtual for driver's route history
driverSchema.virtual("routeHistory", {
  ref: "Schedule",
  localField: "_id",
  foreignField: "driver"
});

// Index for better query performance
driverSchema.index({ availability: 1 });

module.exports = mongoose.model("Driver", driverSchema);
