import bcrypt from "bcryptjs";
import fs from "fs";

import UserModel from "../models/user.model.js";
import { generateTokens, verifyRefreshToken } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { validateRegister, validateLogin } from "../validators/auth.validator.js";
import { getClientIp, fetchLocationFromIp } from "../utils/location.js";
import config from "../config/env.js";

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: build full URL for a stored profile picture filename
// ─────────────────────────────────────────────────────────────────────────────
const profilePictureUrl = (filename) =>
  filename ? `${config.baseUrl}/uploads/${filename}` : null;

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: strip sensitive fields — NEVER send passwordHash to frontend
// ─────────────────────────────────────────────────────────────────────────────
const sanitizeUser = (user) => ({
  id:             user.id,
  firstName:      user.firstName,
  lastName:       user.lastName,
  fullName:       `${user.firstName} ${user.lastName}`,
  email:          user.email,
  profilePicture: profilePictureUrl(user.profilePicture),
  location:       user.location,
  createdAt:      user.createdAt,
});

// ─────────────────────────────────────────────────────────────────────────────
//  REGISTER
//  POST /api/auth/register
//  Content-Type: multipart/form-data
//
//  Frontend sends:
//    firstName, lastName, email, password, confirmPassword (all strings)
//    profilePicture (optional file — jpeg/png/webp, max 5MB)
// ─────────────────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  // 1. Validate inputs
  const errors = validateRegister(req.body);
  if (errors.length > 0) {
    if (req.file) fs.unlinkSync(req.file.path);
    return sendError(res, { message: "Validation failed.", errors, statusCode: 400 });
  }

  const { firstName, lastName, email, password } = req.body;

  // 2. Check duplicate email — query the real DB
  const exists = await UserModel.emailExists(email);
  if (exists) {
    if (req.file) fs.unlinkSync(req.file.path);
    return sendError(res, {
      message: "An account with this email already exists.",
      statusCode: 409,
    });
  }

  // 3. Auto-detect location from IP
  const ip = getClientIp(req);
  const location = await fetchLocationFromIp(ip);

  // 4. Hash password — never store plain text
  const passwordHash = await bcrypt.hash(password, 12);

  // 5. Insert into PostgreSQL
  const newUser = await UserModel.create({
    firstName,
    lastName,
    email,
    passwordHash,
    profilePicture: req.file?.filename || null,
    location,
  });

  // 6. Issue JWT tokens
  const { accessToken, refreshToken } = generateTokens(newUser.id);

  return sendSuccess(res, {
    message: "Registration successful!",
    statusCode: 201,
    data: {
      user: sanitizeUser(newUser),
      accessToken,
      refreshToken,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN
//  POST /api/auth/login
//  Content-Type: application/json
//
//  Frontend sends: { "email": "...", "password": "..." }
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  const errors = validateLogin(req.body);
  if (errors.length > 0)
    return sendError(res, { message: "Validation failed.", errors, statusCode: 400 });

  const { email, password } = req.body;

  // Fetch user from DB
  const user = await UserModel.findByEmail(email);

  // Use same error message for "not found" and "wrong password"
  // — never reveal which one failed (security best practice)
  if (!user) {
    return sendError(res, { message: "Invalid email or password.", statusCode: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return sendError(res, { message: "Invalid email or password.", statusCode: 401 });
  }

  const { accessToken, refreshToken } = generateTokens(user.id);

  return sendSuccess(res, {
    message: "Login successful!",
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
//  REFRESH TOKEN
//  POST /api/auth/refresh
//  Body: { "refreshToken": "..." }
//
//  Call this when any protected API returns 403.
//  Get a new accessToken and retry silently.
// ─────────────────────────────────────────────────────────────────────────────
export const refresh = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return sendError(res, { message: "Refresh token is required.", statusCode: 401 });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const { accessToken } = generateTokens(decoded.userId);
    return sendSuccess(res, { message: "Token refreshed.", data: { accessToken } });
  } catch {
    return sendError(res, {
      message: "Refresh token is invalid or expired. Please log in again.",
      statusCode: 403,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET CURRENT USER  (/me)
//  GET /api/auth/me
//  Header: Authorization: Bearer <accessToken>
//
//  App launch → call this → populate HomeScreen from fresh DB data
// ─────────────────────────────────────────────────────────────────────────────
export const me = async (req, res) => {
  const user = await UserModel.findById(req.user.userId);
  if (!user)
    return sendError(res, { message: "User not found.", statusCode: 404 });

  return sendSuccess(res, { data: { user: sanitizeUser(user) } });
};