import axios from "axios";

/**
 * Extract the real client IP from the request.
 * Works behind proxies / load balancers (Nginx, AWS ALB, etc.)
 */
export const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress || "127.0.0.1";
};

/**
 * Fetch geographic location from a client IP using ipapi.co (free, no key).
 * Free tier: 1,000 requests/day.
 *
 * On localhost the IP will be 127.0.0.1 → returns a "Unknown" fallback.
 * In production with a real public IP, full location is returned.
 *
 * @param {string} ip
 * @returns {Promise<object>} location object
 */
export const fetchLocationFromIp = async (ip) => {
  const fallback = {
    ip,
    city: "Unknown",
    region: "Unknown",
    country: "Unknown",
    latitude: null,
    longitude: null,
    timezone: null,
    currency: null,
  };

  // ipapi.co returns garbage for localhost / private IPs
  const isPrivate =
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip?.startsWith("192.168.") ||
    ip?.startsWith("10.") ||
    ip?.startsWith("::ffff:127.");

  if (isPrivate) return { ...fallback, note: "Localhost — geolocation skipped" };

  try {
    const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: 5000,
    });

    if (data?.error) return fallback;

    return {
      ip: data.ip,
      city: data.city || "Unknown",
      region: data.region || "Unknown",
      country: data.country_name || "Unknown",
      countryCode: data.country_code,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      currency: data.currency,
    };
  } catch {
    return fallback; // Non-fatal — don't block registration
  }
};