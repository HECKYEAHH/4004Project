if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totpSecret: { type: String, default: "" },
});

const User = mongoose.model("User", userSchema);

// ✅ Create New Account (Signup)
app.post("/create-account", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: "Account created successfully!" });
});

// ✅ User Login Endpoint
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true, username });
});

// ✅ Generate TOTP QR Code for Google Authenticator
app.post("/generate-totp", async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    const secret = speakeasy.generateSecret({ length: 20 });
    user.totpSecret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, qrCode) => {
        if (err) return res.status(500).json({ error: "QR code generation failed" });

        res.json({ secret: secret.base32, qrCode });
    });
});

// ✅ Verify TOTP Code
app.post("/verify-totp", async (req, res) => {
    const { username, code } = req.body;
    if (!username || !code) return res.status(400).json({ error: "Username and code required" });

    const user = await User.findOne({ username });
    if (!user || !user.totpSecret) {
        return res.status(400).json({ error: "User not found or TOTP not set up" });
    }

    const isValid = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: "base32",
        token: code,
        window: 1, 
    });

    res.json({ success: isValid });
});

// ✅ Handle Google Sign-In token validation
app.post("/validate-google-token", (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ success: false, message: "Invalid token" });
    }

    console.log("Google Token Received:", token);
    
    res.json({ success: true });
});
const path = require("path");

//  Serve static files from "public" (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

// Serve create-account page
app.get('/create-account', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'create-account.html'));
});

  //TEST
// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
