const asyncHandler = require("express-async-handler");
const Driver = require("../models/driver.model");
const Schedule = require("../models/schedule.model");
const ApiError = require("../../utils/ApiError");

class DriverController {
  // Create a new driver
  createDriver = asyncHandler(async (req, res, next) => {
    // Check if driver with same name already exists
    const existingDriver = await Driver.findOne({
      name: req.body.name
    });

    if (existingDriver) {
      return next(new ApiError("Driver with this name already exists", 400));
    }

    const driver = await Driver.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        driver
      }
    });
  });

  getDrivers = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const drivers = await Driver.find().skip(skip).limit(parseInt(limit));
    const total = await Driver.countDocuments();
    res.status(200).json({
      status: "success",
      results: drivers.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: { drivers }
    });
  });

  getDriver = asyncHandler(async (req, res, next) => {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return next(new ApiError("Driver not found", 404));
    }
    res.status(200).json({ status: "success", data: { driver } });
  });

  updateDriver = asyncHandler(async (req, res, next) => {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!driver) {
      return next(new ApiError("Driver not found", 404));
    }
    res.status(200).json({ status: "success", data: { driver } });
  });

  deleteDriver = asyncHandler(async (req, res, next) => {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return next(new ApiError("Driver not found", 404));
    }
    res.status(204).json({ status: "success", data: null });
  });

  // Get driver's route history
  getDriverHistory = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const skip = (page - 1) * limit;

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return next(new ApiError("Driver not found", 404));
    }

    const filter = { driver: req.params.id };
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get driver's schedule history
    const schedules = await Schedule.find(filter)
      .populate(
        "route",
        "startLocation endLocation distance estimatedTime status"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Schedule.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: schedules.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: {
        driver: {
          id: driver._id,
          name: driver.name,
          licenseType: driver.licenseType,
          availability: driver.availability
        },
        schedules
      }
    });
  });

  // Get available drivers
  getAvailableDrivers = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find drivers that are available and active
    const drivers = await Driver.find({
      availability: true,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Driver.countDocuments({
      availability: true,
      isActive: true
    });

    res.status(200).json({
      status: "success",
      results: drivers.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: {
        drivers
      }
    });
  });
}

module.exports = new DriverController();
