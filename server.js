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
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// This is the User scheme, more will be added like the data for the clicker
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, //Ensures unique usernames
    email: {type: String, required: true, unique: true}, //Ensures unique emails
    password: { type: String, required: true },         //Stores a hashed password
    resetTokens: {type: String, default: ""},           //Password reset token
    resetTokenExpiration:{type: Date, default: null},    // Expiration of password reset token
    totpSecret: { type: String, default: "" },          //Used for 2FA, not implemented
});

const User = mongoose.model("User", userSchema);

// ✅ Create New Account (Signup)
// ✅ Create New Account (Signup)
app.post("/create-account", async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "Username, email, and password are required" });
    }

    // Check if the email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Username already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
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


// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'public', 'views')));


// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

// Serve the create account page
app.get('/create-account', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'create-account.html'));
});
//Server forget-password page
app.get('/forgot-password.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'forgot-password.html'));
});

//serve actual reset password
app.get('/reset-password.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'reset-password.html'));
});



//Password reset
const resetTokens = new Map(); // Temporary storage (use DB in production)

// Forgot Password API Endpoint
app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ success: false, message: "No account found with this email." });
    }

    // ✅ Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetTokens = token; // <-- Updated to use "resetTokens"
    user.resetTokenExpiration = Date.now() + 3600000; // 1-hour expiration
    await user.save();

    const resetLink = `https://cis4004app-6e9d945f299e.herokuapp.com/reset-password.html?token=${token}`;
    console.log("Reset link generated:", resetLink); // Debug log to verify

    // ✅ Send email
    const transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
            user: "apikey",  // This is required for SendGrid
            pass: process.env.SENDGRID_API_KEY,  // Your API Key stored in Heroku
        },
    });
    
    await transporter.sendMail({
        from: '"MineClicker Support" <MineClickerReset@gmail.com>', // Your verified email
        to: email,
        subject: "Password Reset Request",
        text: `Click the following link to reset your password: ${resetLink}`,
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({ success: true, message: "Password reset email sent successfully!" }); // ✅ Added success response
});


//Actual password reset functionality
app.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ resetTokens: token, resetTokenExpiration: { $gt: Date.now() } });

    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired token." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetTokens = ""; // ✅ Clear after reset
    user.resetTokenExpiration = null;
    await user.save();

    res.json({ success: true, message: "Password reset successful! You can now log in." });
});



  //TEST
// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
