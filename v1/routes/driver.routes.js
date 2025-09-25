const express = require("express");
const driverController = require("../controllers/driver.controller");
const driverValidator = require("../validators/driver.validator");

const router = express.Router();

// Driver routes
router
  .route("/")
  .post(driverValidator.createDriverValidation, driverController.createDriver)
  .get(driverController.getDrivers);

router
  .route("/:id")
  .get(driverController.getDriver)
  .patch(driverValidator.updateDriverValidation, driverController.updateDriver)
  .delete(driverController.deleteDriver);

// Driver history route
router.route("/:id/history").get(driverController.getDriverHistory);

module.exports = router;
