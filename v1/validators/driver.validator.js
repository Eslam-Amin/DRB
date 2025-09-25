const Joi = require("joi");
const joiErrorHandler = require("../../utils/joiErrorHandler");
const asyncHandler = require("express-async-handler");

class DriverValidator {
  createDriverValidation = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
      licenseType: Joi.string().valid("A", "B", "C", "D").required(),
      availability: Joi.boolean().default(true)
    });
    joiErrorHandler(schema, req);
    next();
  });

  updateDriverValidation = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(50).optional(),
      licenseType: Joi.string().valid("A", "B", "C", "D").optional()
    });
    joiErrorHandler(schema, req);
    next();
  });
}

module.exports = new DriverValidator();
