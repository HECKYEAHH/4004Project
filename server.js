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

  //PlayerDB data
  minecraftUsername: {type: String}, //Like HECKYEAH or something like that
  minecraftAvatarURL: {type: String}, //the web page to get the avatar url
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

//setup minecraft
app.get("/setup-minecraft", requiresAuth(), async (req, res) => {
  // Simple example: serve an HTML page with a <form> for them to enter their MC username
  res.sendFile(path.join(__dirname, "public", "views", "minecraftSetup.html"));
});


app.post("/setup-minecraft", requiresAuth(), async (req, res) => {
  try {
    const { sub } = req.oidc.user;
    const { minecraftUsername } = req.body;

    if (!minecraftUsername) {
      return res.status(400).send("Minecraft username is required.");
    }

    // 1) Call PlayerDB to verify the username / get avatar
    const url = `https://playerdb.co/api/player/minecraft/${encodeURIComponent(minecraftUsername)}`;
    const resp = await axios.get(url);
    if (!resp.data.success || !resp.data.data || !resp.data.data.player) {
      return res.status(404).send("Could not find that Minecraft username on PlayerDB!");
    }

    // 2) Extract data
    const playerInfo = resp.data.data.player;
    // e.g. { username: 'Notch', avatar: 'https://minotar.net/avatar/Notch', ... }
    const mcUsernameFinal = playerInfo.username; // might differ by case
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
    minecraftUsername: userDoc.minecraftUsername,        // <--- added
    minecraftAvatarURL: userDoc.minecraftAvatarURL,      // <--- added
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

// idle.html
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



// Optional profile route
app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user, null, 2));
});

// 6) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
