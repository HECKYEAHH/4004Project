// Initialize Google Sign-In when the page loads
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID", // Replace with your actual Google Client ID
        callback: handleGoogleLogin, // Callback function to handle login response
    });

    // Render the Google Sign-In button inside the element with ID "googleSignIn"
    google.accounts.id.renderButton(
        document.getElementById("googleSignIn"),
        { theme: "outline", size: "large" } // Customize button appearance
    );
};

// Handle Google Login Response
function handleGoogleLogin(response) {
    console.log("Encoded JWT ID token: " + response.credential); // Log the JWT token

    // Send the received Google JWT token to the backend for validation
    fetch("/validate-google-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }), // Send token in JSON format
    })
        .then((res) => res.json()) // Convert response to JSON
        .then((data) => {
            if (data.success) {
                alert("Google Login Successful!");
                // If login is successful, proceed to TOTP authentication
                showTwoFactorPrompt();
            } else {
                alert("Google Login Failed!");
            }
        })
        .catch((err) => console.error("Error validating token:", err));
}

// Show Two-Factor Authentication (TOTP) Prompt
function showTwoFactorPrompt(username) {
    fetch("http://localhost:3000/generate-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.qrCode) {
            const totpPrompt = document.createElement("div");
            totpPrompt.innerHTML = `
                <h2>Two-Factor Authentication</h2>
                <p>Scan this QR code with Google Authenticator:</p>
                <img src="${data.qrCode}" alt="QR Code">
                <p>Then enter the 6-digit code below:</p>
                <input type="text" id="totpCode" maxlength="6" placeholder="Enter code" required />
                <button id="verifyTOTP">Verify</button>
            `;
            document.body.appendChild(totpPrompt);

            // Add event listener for verification
            document.getElementById("verifyTOTP").addEventListener("click", function () {
                verifyTOTP(username);
            });
        } else {
            alert("Failed to generate TOTP QR code.");
        }
    })
    .catch(err => console.error("Error setting up TOTP:", err));
}


// Verify the TOTP Code (Server-Side Validation)
function verifyTOTP(username) {
    const totpCode = document.getElementById("totpCode").value;

    fetch("http://localhost:3000/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: totpCode }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("✅ TOTP Verified! Login Successful.");
            window.location.href = "/game"; // Redirect to game
        } else {
            alert("❌ Invalid TOTP Code. Try again.");
        }
    })
    .catch(err => console.error("Error verifying TOTP:", err));
}

// Event Listener for Manual Login Form Submission
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    const username = document.getElementById("username").value; // Get username input
    const password = document.getElementById("password").value; // Get password input

    // Send username and password to the backend for validation
    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), // Send login credentials in JSON format
    })
        .then((res) => res.json()) // Convert response to JSON
        .then((data) => {
            if (data.success) {
                alert("Login Successful!");
                // If login is successful, proceed to TOTP authentication
                showTwoFactorPrompt();
            } else {
                alert("Login Failed. Check your username and password.");
            }
        })
        .catch((err) => console.error("Error during login:", err));
});

// Event Listener for Account Creation Button Click
document.getElementById("createAccountButton").addEventListener("click", function () {
    window.location.href = "/create-account"; // Redirect the user to the account creation page
});
