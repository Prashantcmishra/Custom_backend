/**
 * Standardised response helpers.
 * Every API response has: { success, message, data? }
 */

export const sendSuccess = (res, { message = "Success", data = {}, statusCode = 200 } = {}) =>
  res.status(statusCode).json({ success: true, message, ...data });

export const sendError = (res, { message = "Something went wrong", statusCode = 500, errors = null } = {}) =>
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });