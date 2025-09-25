const asyncHandler = require("express-async-handler");
const Route = require("../models/route.model");
const Schedule = require("../models/schedule.model");
const Driver = require("../models/driver.model");

const ApiError = require("../../utils/ApiError");

class RouteController {
  // Create a new route
  createRoute = asyncHandler(async (req, res, next) => {
    // Create the route
    const route = await Route.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        route
      }
    });
  });

  // Get all routes with pagination and filtering
  getRoutes = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get routes with pagination
    const routes = await Route.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalDocs = await Route.countDocuments();

    res.status(200).json({
      status: "success",
      results: routes.length,
      totalDocs,
      page: parseInt(page),
      totalPages: Math.ceil(totalDocs / limit),
      data: {
        routes
      }
    });
  });

  // Get unassigned routes
  getUnassignedRoutes = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find routes that are pending (not assigned)
    const routes = await Route.find({
      status: "unassigned"
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Route.countDocuments({
      status: "unassigned"
    });

    res.status(200).json({
      status: "success",
      results: routes.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: {
        routes
      }
    });
  });

  getRoute = asyncHandler(async (req, res, next) => {
    const { routeId } = req.params;
    const route = await Route.findById(routeId);
    if (!route) {
      return next(new ApiError("Route not found", 404));
    }
    res.status(200).json({ status: "success", data: { route } });
  });

  updateRoute = asyncHandler(async (req, res, next) => {
    const { routeId } = req.params;
    const route = await Route.findByIdAndUpdate(routeId, req.body, {
      new: true
    });
    if (!route) {
      return next(new ApiError("Route not found", 404));
    }
    res.status(200).json({ status: "success", data: { route } });
  });

  deleteRoute = asyncHandler(async (req, res, next) => {
    const { routeId } = req.params;
    const route = await Route.findByIdAndDelete(routeId);
    if (!route) {
      return next(new ApiError("Route not found", 404));
    }
    res.status(204).json({ status: "success", data: null });
  });

  // Helper function to assign a driver to a route
  assignDriverToRoute = asyncHandler(async (req, res, next) => {
    const { driverId } = req.body;
    const { routeId } = req.params;
    const { driver, route } = req;
    // Create schedule assignment
    const schedule = await Schedule.create({
      driver: driverId,
      route: routeId
    });

    await route.updateOne({ $set: { status: "assigned" } });
    await driver.updateOne({ $set: { availability: false } });
    res.status(201).json({
      status: "success",
      data: {
        schedule
      }
    });
  });

  unassignDriverFromRoute = asyncHandler(async (req, res, next) => {
    const { driver, existingRoute: route } = req;
    await route.updateOne({ $set: { status: "unassigned" } });
    await driver.updateOne({ $set: { availability: true } });
    res.status(200).json({ status: "success", data: null });
  });

  finishRoute = asyncHandler(async (req, res, next) => {
    const { existingRoute: route } = req;
    await route.updateOne({ $set: { status: "completed" } });
    const schedule = await Schedule.findOneAndUpdate(
      { route: route._id },
      { $set: { status: "completed", completedAt: new Date() } },
      { new: true }
    );
    await Driver.updateOne(
      { _id: schedule.driver },
      { $set: { availability: true } }
    );
    res.status(200).json({ status: "success", data: null });
  });
}
module.exports = new RouteController();
