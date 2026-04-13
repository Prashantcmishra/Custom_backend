import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/env.js";
import { connectDB } from "./config/db.js";
import { runMigrations } from "./config/migrate.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import errorHandler from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Updated CORS - Most Important for React Native
app.use(cors({
  origin: "*",                    // Allow all origins (good for testing)
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Length"]
}));

// Increase limits for file upload
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

// Health check
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date(), env: config.nodeEnv })
);

// 404
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found." })
);

// Global error handler
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDB();
    await runMigrations();
    app.listen(config.port, () => {
      console.log(`\n🚀 Server running → http://localhost:${config.port}`);
      console.log(`📁 Uploads served → http://localhost:${config.port}/uploads`);
      console.log(`🌍 Environment → ${config.nodeEnv}\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

start();

export default app;