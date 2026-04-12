import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

import UserStore from "../models/userStore.js";
import { generateTokens, verifyRefreshToken } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { validateRegister, validateLogin } from "../validators/auth.validator.js";
import { getClientIp, fetchLocationFromIp } from "../utils/location.js";
import config from "../config/env.js";

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: Build the public URL for a stored profile picture filename
// ─────────────────────────────────────────────────────────────────────────────
const profilePictureUrl = (filename) =>
  filename ? `${config.baseUrl}/uploads/${filename}` : null;

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: Strip sensitive fields before sending user to frontend
// ─────────────────────────────────────────────────────────────────────────────
const sanitizeUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`,
  email: user.email,
  profilePicture: profilePictureUrl(user.profilePicture),
  location: user.location,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────────────────────────────────────
//  REGISTER
//  POST /api/auth/register
//  Content-Type: multipart/form-data
//
//  Frontend sends:
//    firstName       (string, required)
//    lastName        (string, required)
//    email           (string, required)
//    password        (string, required)
//    confirmPassword (string, required)
//    profilePicture  (file, optional — image/jpeg|png|webp, max 5MB)
// ─────────────────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  // 1. Validate fields
  const errors = validateRegister(req.body);
  if (errors.length > 0) {
    if (req.file) fs.unlinkSync(req.file.path); // discard upload on error
    return sendError(res, { message: "Validation failed.", errors, statusCode: 400 });
  }

  const { firstName, lastName, email, password } = req.body;

  // 2. Duplicate email check
  if (UserStore.findByEmail(email)) {
    if (req.file) fs.unlinkSync(req.file.path);
    return sendError(res, {
      message: "An account with this email already exists.",
      statusCode: 409,
    });
  }

  // 3. Auto-detect location from client IP
  const ip = getClientIp(req);
  const location = await fetchLocationFromIp(ip);

  // 4. Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // 5. Persist user
  const newUser = UserStore.create({
    id: uuidv4(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    profilePicture: req.file?.filename || null, // stored filename only
    location,
    createdAt: new Date().toISOString(),
  });

  // 6. Issue tokens
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
//  Frontend sends:
//    { "email": "user@example.com", "password": "secret123" }
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  const errors = validateLogin(req.body);
  if (errors.length > 0)
    return sendError(res, { message: "Validation failed.", errors, statusCode: 400 });

  const { email, password } = req.body;

  // Find user
  const user = UserStore.findByEmail(email);
  if (!user)
    return sendError(res, {
      message: "Invalid email or password.",
      statusCode: 401,
    });

  // Compare password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch)
    return sendError(res, {
      message: "Invalid email or password.",
      statusCode: 401,
    });

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
//  Content-Type: application/json
//
//  Frontend sends:
//    { "refreshToken": "<stored refresh token>" }
//
//  When to call this:
//    When an API returns 403 with "Access token has expired",
//    silently call this endpoint, get a new accessToken, and retry.
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
//  GET CURRENT USER  (me)
//  GET /api/auth/me
//  Header: Authorization: Bearer <accessToken>
//
//  Frontend use case:
//    App launch → read stored tokens → call /me → populate HomeScreen.
// ─────────────────────────────────────────────────────────────────────────────
export const me = (req, res) => {
  const user = UserStore.findById(req.user.userId);
  if (!user)
    return sendError(res, { message: "User not found.", statusCode: 404 });

  return sendSuccess(res, { data: { user: sanitizeUser(user) } });
};