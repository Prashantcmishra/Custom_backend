import { verifyAccessToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";

/**
 * Middleware: verifies the Bearer access token in Authorization header.
 * Attaches decoded payload to req.user on success.
 *
 * Frontend must send:
 *   Authorization: Bearer <accessToken>
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, {
      message: "Access token missing. Send: Authorization: Bearer <token>",
      statusCode: 401,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyAccessToken(token); // { userId, iat, exp }
    next();
  } catch (err) {
    const isExpired = err.name === "TokenExpiredError";
    return sendError(res, {
      message: isExpired
        ? "Access token has expired. Please refresh your token."
        : "Invalid access token.",
      statusCode: 403,
    });
  }
};

export default authenticate;