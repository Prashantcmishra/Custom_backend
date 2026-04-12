import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getEmployees } from "../controllers/employee.controller.js";

const router = Router();

// All employee routes are protected
router.get("/", authenticate, getEmployees);

export default router;