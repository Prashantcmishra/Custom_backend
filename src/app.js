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
const __dirname  = path.dirname(__filename);

const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded profile pictures
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth",      authRoutes);
app.use("/api/employees", employeeRoutes);

// Health check
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date(), env: config.nodeEnv })
);

// 404
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found." })
);

// Global error handler (must be last)
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
//  Startup sequence:
//  1. Connect to PostgreSQL
//  2. Run migrations (create tables if they don't exist)
//  3. Start HTTP server
// ─────────────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  await runMigrations();
  app.listen(config.port, () => {
    console.log(`\n🚀  Server running   → http://localhost:${config.port}`);
    console.log(`📁  Uploads served  → http://localhost:${config.port}/uploads`);
    console.log(`🌍  Environment     → ${config.nodeEnv}\n`);
  });
};

start();

export default app; 