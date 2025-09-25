const express = require("express");
const routeController = require("../controllers/route.controller");
const routesValidator = require("../validators/route.validator");

const router = express.Router();

// Route routes
router
  .route("/")
  .post(routesValidator.createRouteValidation, routeController.createRoute)
  .get(routeController.getRoutes);

router
  .route("/:id")
  .get(routeController.getRoute)
  .patch(routesValidator.updateRouteValidation, routeController.updateRoute)
  .delete(routeController.deleteRoute);

router
  .route("/:id/assign-driver")
  .post(
    routesValidator.assignDriverToRouteValidation,
    routeController.assignDriverToRoute
  );

module.exports = router;
