const asyncHandler = require("express-async-handler");
const Schedule = require("../models/schedule.model");
const Driver = require("../models/driver.model");
const Route = require("../models/route.model");

const ApiError = require("../../utils/ApiError");

class ScheduleController {
  // Get all schedule assignments
  getSchedule = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Get schedules with pagination
    const schedules = await Schedule.find()
      .populate("driver", "name licenseType availability")
      .populate(
        "route",
        "startLocation endLocation distance estimatedTime status"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Schedule.countDocuments();

    res.status(200).json({
      status: "success",
      results: schedules.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: {
        schedules
      }
    });
  });

  // Get a single schedule assignment by ID
  getScheduleById = asyncHandler(async (req, res, next) => {
    const schedule = await Schedule.findById(req.params.id)
      .populate("driver", "name licenseType availability")
      .populate(
        "route",
        "startLocation endLocation distance estimatedTime status"
      );

    if (!schedule) {
      return next(new ApiError("Schedule assignment not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        schedule
      }
    });
  });
}
module.exports = new ScheduleController();
