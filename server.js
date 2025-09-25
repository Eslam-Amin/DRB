const connectDB = require("./db/dbConnect");
const app = require("./app");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, async () => {
  await connectDB();
  console.log(
    `Server running on port ${port} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated!");
  });
});

module.exports = server;
