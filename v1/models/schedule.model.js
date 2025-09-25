const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: [true, "Driver is required"]
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "Route is required"]
    },
    status: {
      type: String,
      enum: {
        values: ["active", "completed", "cancelled"],
        message: "Status must be active, completed, or cancelled"
      },
      default: "active"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better query performance
scheduleSchema.index({ driver: 1, status: 1 });
scheduleSchema.index({ route: 1, status: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);
