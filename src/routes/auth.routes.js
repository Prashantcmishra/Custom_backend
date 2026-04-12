import { Router } from "express";
import upload from "../middlewares/upload.js";
import authenticate from "../middlewares/authenticate.js";
import { register, login, refresh, me } from "../controllers/auth.controller.js";

const router = Router();

// Public routes
router.post("/register", upload.single("profilePicture"), register);
router.post("/login", login);
router.post("/refresh", refresh);

// Protected routes
router.get("/me", authenticate, me);

export default router;