const Joi = require("joi");
const asyncHandler = require("express-async-handler");
const joiErrorHandler = require("../../utils/joiErrorHandler");
const Driver = require("../models/driver.model");
const Route = require("../models/route.model");
const ApiError = require("../../utils/ApiError");

class RouteValidator {
  createRouteValidation = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
      startLocation: Joi.string().min(2).max(100).required(),
      endLocation: Joi.string().min(2).max(100).required(),
      distance: Joi.number().positive().max(10000).required(),
      estimatedTime: Joi.number().integer().min(1).max(1440).required()
    });
    joiErrorHandler(schema, req);
    next();
  });

  updateRouteValidation = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
      startLocation: Joi.string().min(2).max(100).optional(),
      endLocation: Joi.string().min(2).max(100).optional(),
      distance: Joi.number().positive().max(10000).optional(),
      estimatedTime: Joi.number().integer().min(1).max(1440).optional()
    });
    joiErrorHandler(schema, req);
    next();
  });

  assignDriverToRouteValidation = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
      driverId: Joi.string().required()
    });
    joiErrorHandler(schema, req);

    const { driverId } = req.body;
    const { id: routeId } = req.params;
    const existingDriver = await Driver.findById(driverId);
    if (!existingDriver) return next(new ApiError("Driver not found", 404));

    const existingRoute = await Route.findById(routeId);
    if (!existingRoute) return next(new ApiError("Route not found", 404));

    if (!existingDriver.availability)
      return next(new ApiError("Driver is not available", 400));

    if (existingRoute.status === "assigned")
      return next(new ApiError("Route is already assigned", 400));

    req.driver = existingDriver;
    req.route = existingRoute;
    next();
  });

  unassignDriverFromRouteValidation = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
      driverId: Joi.string().required()
    });
    joiErrorHandler(schema, req);
    const { driverId } = req.body;
    const { routeId } = req.params;

    const [existingDriver, existingRoute] = await Promise.all([
      Driver.findById(driverId),
      Route.findById(routeId)
    ]);

    if (!existingDriver) return next(new ApiError("Driver not found", 404));

    if (!existingRoute) return next(new ApiError("Route not found", 404));

    if (existingDriver.availability)
      return next(new ApiError("Driver is already available", 400));

    if (existingRoute.status === "unassigned")
      return next(new ApiError("Route is already unassigned", 400));

    req.existingDriver = existingDriver;
    req.existingRoute = existingRoute;
    next();
  });

  finishRouteValidation = asyncHandler(async (req, res, next) => {
    const { routeId } = req.params;
    const existingRoute = await Route.findById(routeId);
    if (!existingRoute) return next(new ApiError("Route not found", 404));
    if (existingRoute.status === "completed")
      return next(new ApiError("Route is already completed", 400));
    if (existingRoute.status === "unassigned")
      return next(new ApiError("Route is not assigned", 400));
    req.existingRoute = existingRoute;
    next();
  });
}

module.exports = new RouteValidator();
