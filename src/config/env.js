import dotenv from "dotenv";
dotenv.config();

// All environment variables in one place.
// The rest of the app imports from here — never directly from process.env.
const config = {
  port: process.env.PORT || 5000,
  baseUrl: process.env.BASE_URL || "http://localhost:5000",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET || "fallback_access_secret",
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret",
    accessExpires: process.env.ACCESS_TOKEN_EXPIRES || "15m",
    refreshExpires: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  },
};

export default config;