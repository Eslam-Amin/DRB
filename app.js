const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
require("dotenv").config();

// Import routes
const routeRoutes = require("./v1/routes/route.routes");
const driverRoutes = require("./v1/routes/driver.routes");
const scheduleRoutes = require("./v1/routes/schedule.routes");

// Import error handling middleware
const globalErrorHandler = require("./utils/errorController");

const app = express();

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
    credentials: true
  })
);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Routes
app.use("/api/v1/routes", routeRoutes);
app.use("/api/v1/drivers", driverRoutes);
app.use("/api/v1/schedule", scheduleRoutes);

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Route Scheduling System API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Route Scheduling System API",
    version: "1.0.0",
    endpoints: {
      routes: "/api/v1/routes",
      drivers: "/api/v1/drivers",
      schedule: "/api/v1/schedule",
      health: "/api/v1/health"
    }
  });
});

// Handle undefined routes
app.all("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = "fail";
  err.statusCode = 404;
  next(err);
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
