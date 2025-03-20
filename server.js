require("dotenv").config();

const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");
const path = require("path");
const cors = require("cors");

// If you still want Mongo (e.g. to store user game data):
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

/*
// Example schema if you want to store data per user (using Auth0's "sub" as unique key).
const userSchema = new mongoose.Schema({
  auth0Sub: { type: String, unique: true },
  gold: { type: Number, default: 0 },
});
const User = mongoose.model("User", userSchema);
*/

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Auth0 Configuration ---
const config = {
  authRequired: false,  // Only lock down specific routes with "requiresAuth()"
  auth0Logout: true,    // Let users fully log out of Auth0
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL || "http://localhost:3000",
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
};

// --- Auth0 Middleware ---
app.use(auth(config));

// --- Serve Static Files ---
app.use(express.static(path.join(__dirname, "public")));

// --- Routes ---

// 1) Home (Landing) Page
app.get("/", (req, res) => {
  // If "index.html" is in "public/views", adjust path accordingly:
  res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

// 2) Protected Game Page
app.get("/idle_game", requiresAuth(), async (req, res) => {
  // If you want to handle user info in DB:
  // const sub = req.oidc.user.sub;
  // let userDoc = await User.findOne({ auth0Sub: sub });
  // if (!userDoc) { userDoc = new User({ auth0Sub: sub }); await userDoc.save(); }

  // Then serve the game
  res.sendFile(path.join(__dirname, "public", "views", "idle_game.html"));
});

// 3) (Optional) Profile route to see Auth0 user data 
app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user, null, 2));
});

// The library automatically provides /login, /logout, /callback, etc.

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
