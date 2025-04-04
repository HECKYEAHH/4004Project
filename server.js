require("dotenv").config();

const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

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

  // Any other fields from PlayerDB
  minecraftUsername: { type: String },
  minecraftAvatarURL: { type: String },

  // The game data. Mirror your front-end structure
  gameData: {
    cakes: { type: Number, default: 0 },
    cakesPerSecond: { type: Number, default: 0 },
    cakesPerClick: { type: Number, default: 1 },
    resources: {
      cursor: { type: Number, default: 0 },
      farmer: { type: Number, default: 0 },
      cow: { type: Number, default: 0 },
      chicken: { type: Number, default: 0 },
      sugarMaster: { type: Number, default: 0 },
      baker: { type: Number, default: 0 },
      // Add others if needed
    },
    achievements: { type: Array, default: [] },
    rebirthCount: { type: Number, default: 0 },
    upgradesPurchased: { type: Array, default: [] },
  }
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

// Setup MC
app.get("/setup-minecraft", requiresAuth(), async (req, res) => {
  // Serve the HTML form
  res.sendFile(path.join(__dirname, "public", "views", "minecraftSetup.html"));
});

app.post("/setup-minecraft", requiresAuth(), async (req, res) => {
  try {
    const { sub } = req.oidc.user;
    const { minecraftUsername } = req.body;

    if (!minecraftUsername) {
      return res.status(400).send("Minecraft username is required.");
    }

    // 1) Call PlayerDB
    const url = `https://playerdb.co/api/player/minecraft/${encodeURIComponent(minecraftUsername)}`;
    const resp = await axios.get(url);
    if (!resp.data.success || !resp.data.data || !resp.data.data.player) {
      return res.status(404).send("Could not find that Minecraft username on PlayerDB!");
    }

    // 2) Extract data
    const playerInfo = resp.data.data.player;
    const mcUsernameFinal = playerInfo.username;
    const mcAvatarURL = playerInfo.avatar;

    // 3) Save to Mongo
    let userDoc = await User.findOne({ auth0Sub: sub });
    if (!userDoc) {
      return res.status(404).send("User not found in DB!");
    }
    userDoc.minecraftUsername = mcUsernameFinal;
    userDoc.minecraftAvatarURL = mcAvatarURL; 
    await userDoc.save();

    // 4) Redirect to /idle
    res.redirect("/idle");
  } catch (err) {
    console.error("Error in /setup-minecraft POST route:", err);
    res.status(500).send("Server error setting your Minecraft username.");
  }
});

// GET /api/me
app.get("/api/me", requiresAuth(), async (req, res) => {
  const { sub } = req.oidc.user;
  const userDoc = await User.findOne({ auth0Sub: sub });
  if (!userDoc) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({
    nickname: userDoc.nickname,
    gold: userDoc.gold,
    minecraftUsername: userDoc.minecraftUsername,
    minecraftAvatarURL: userDoc.minecraftAvatarURL,
  });
});

// POST /api/me (Update user data, e.g. gold)
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

// Idle
app.get("/idle", requiresAuth(), async (req, res) => {
  const { sub, nickname } = req.oidc.user;
  
  let userDoc = await User.findOne({ auth0Sub: sub });
  if (!userDoc) {
    userDoc = new User({ auth0Sub: sub, nickname, gold: 0 });
    await userDoc.save();
  }

  // Check if userDoc already has a Minecraft username
  if (!userDoc.minecraftUsername) {
    // No MC username? Redirect them to a setup route.
    return res.redirect("/setup-minecraft");
  }

  // Otherwise, serve the game
  res.sendFile(path.join(__dirname, "public", "views", "idle.html"));
});

// --------------- SAVE / LOAD ENDPOINTS --------------- //

// POST /api/saveGame - Save game data to DB
app.post("/api/saveGame", requiresAuth(), async (req, res) => {
  try {
    console.log("POST /api/saveGame invoked");
    const { sub } = req.oidc.user;       // Auth0 user ID
    const { gameData } = req.body;       // The gameData from the request body

    if (!gameData) {
      return res.status(400).json({ error: "No gameData provided" });
    }

    // 1) Find the user in Mongo by their Auth0 ID
    let userDoc = await User.findOne({ auth0Sub: sub });
    if (!userDoc) {
      return res.status(404).json({ error: "No user found in DB" });
    }

    // 2) Set userDoc.gameData to the new data
    userDoc.gameData = gameData;

    // 3) Save the userDoc to Mongo
    await userDoc.save();
    console.log("Game data saved!");
    return res.json({ message: "Game data saved successfully" });
  } catch (err) {
    console.error("Error saving game data:", err);
    return res.status(500).json({ error: "Server error saving game data" });
  }
});


// GET /api/loadGame - Load game data from DB
app.get("/api/loadGame", requiresAuth(), async (req, res) => {
  try {
    console.log("GET /api/loadGame invoked");
    const { sub } = req.oidc.user;

    const userDoc = await User.findOne({ auth0Sub: sub });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    // userDoc.gameData might be an object with cakes, resources, etc.
    console.log("Sending gameData:", userDoc.gameData);
    return res.json(userDoc.gameData || {});
  } catch (err) {
    console.error("Error loading game data:", err);
    return res.status(500).json({ error: "Server error loading game data" });
  }
});
//Game wipe
app.post('/api/wipeSave', requiresAuth(), async (req, res) => {
  try {
    const { sub } = req.oidc.user;

    const userDoc = await User.findOne({ auth0Sub: sub });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    userDoc.gameData = undefined; // or null
    await userDoc.save();

    res.json({ message: "Save wiped." });
  } catch (err) {
    console.error("Wipe error:", err);
    res.status(500).json({ error: "Server error wiping save" });
  }
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