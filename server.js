require("dotenv").config();

const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");

// 1) Connect to Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 2) Define a user schema for storing data by Auth0 sub
const userSchema = new mongoose.Schema({
  auth0Sub: { type: String, unique: true },
  nickname: { type: String },
  gold: { type: Number, default: 0 },
});
const User = mongoose.model("User", userSchema);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Auth0 config
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL || "http://localhost:3000",
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
};
app.use(auth(config));

// 4) Serve static
app.use(express.static(path.join(__dirname, "public")));

// 5) Routes

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

// GET /api/me (Load user data)
app.get("/api/me", requiresAuth(), async (req, res) => {
  const { sub } = req.oidc.user;
  const userDoc = await User.findOne({ auth0Sub: sub });
  if (!userDoc) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({
    nickname: userDoc.nickname,
    gold: userDoc.gold,
  });
});

// POST /api/me (Update user data)
app.post("/api/me", requiresAuth(), async (req, res) => {
  const { sub } = req.oidc.user;
  const { gold } = req.body;
  const userDoc = await User.findOneAndUpdate(
    { auth0Sub: sub },
    { gold },
    { new: true }
  );
  res.json(userDoc);
});

// idle_game route (Protected)
app.get("/idle", requiresAuth(), async (req, res) => {
  const { sub, nickname } = req.oidc.user;

  let userDoc = await User.findOne({ auth0Sub: sub });
  if (!userDoc) {
    userDoc = new User({ auth0Sub: sub, nickname, gold: 0 });
    await userDoc.save();
    console.log("✅ New user created in DB:", userDoc);
  } else {
    console.log("Found existing user in DB:", userDoc);
  }

  // Serve idle.html instead of idle_game.html
  res.sendFile(path.join(__dirname, "public", "views", "idle.html"));
});


// Optional profile route
app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user, null, 2));
});

// 6) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
