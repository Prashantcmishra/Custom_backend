const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Secret keys
const ACCESS_SECRET = "access123";
const REFRESH_SECRET = "refresh123";

const PORT =  5000;

// Dummy user
const USER = {
  userId: "admin",
  password: "123"
};

// 🔹 LOGIN API
app.post("/login", (req, res) => {
  const { userId, password } = req.body;

  if (userId !== USER.userId || password !== USER.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, {
    expiresIn: "15m"
  });

  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: "7d"
  });

  res.json({
    accessToken,
    refreshToken
  });
});

// 🔹 Middleware to verify access token
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
};

// 🔹 PROTECTED API
app.get("/list", authenticate, (req, res) => {
  res.json([
    { id: 1, name: "Prashant" },
    { id: 2, name: "Rahul" },
    { id: 3, name: "Amit" }
  ]);
});

// 🔹 REFRESH TOKEN API (important for real apps)
app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign(
      { userId: user.userId },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});