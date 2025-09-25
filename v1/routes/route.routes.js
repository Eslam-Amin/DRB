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
  .route("/:routeId")
  .get(routeController.getRoute)
  .patch(routesValidator.updateRouteValidation, routeController.updateRoute)
  .delete(routeController.deleteRoute);

router
  .route("/:routeId/assign-driver")
  .post(
    routesValidator.assignDriverToRouteValidation,
    routeController.assignDriverToRoute
  );

router
  .route("/:routeId/unassign-driver")
  .post(
    routesValidator.unassignDriverFromRouteValidation,
    routeController.unassignDriverFromRoute
  );

router
  .route("/:routeId/finish")
  .post(routesValidator.finishRouteValidation, routeController.finishRoute);

module.exports = router;
