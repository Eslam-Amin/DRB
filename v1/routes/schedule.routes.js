const express = require("express");
const scheduleController = require("../controllers/schedule.controller");

const router = express.Router();

// Schedule routes
router.route("/").get(scheduleController.getSchedule);

router.route("/:id").get(scheduleController.getScheduleById);

module.exports = router;
