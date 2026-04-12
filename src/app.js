import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import config from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import errorHandler from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files (profile pictures) ─────────────────────────────────────────
// Served at: GET /uploads/<filename>
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found." }));

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`✅  Server running → http://localhost:${config.port}`);
  console.log(`📁  Uploads served → http://localhost:${config.port}/uploads`);
});

export default app;