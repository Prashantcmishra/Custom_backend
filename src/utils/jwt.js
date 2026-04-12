import jwt from "jsonwebtoken";
import config from "../config/env.js";

/**
 * Generate a short-lived access token and a long-lived refresh token.
 * @param {string} userId
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires,
  });

  const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires,
  });

  return { accessToken, refreshToken };
};

/**
 * Verify an access token. Returns decoded payload or throws.
 */
export const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.accessSecret);

/**
 * Verify a refresh token. Returns decoded payload or throws.
 */
export const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret);