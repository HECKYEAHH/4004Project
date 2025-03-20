// public/js/login.js
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
      loginButton.addEventListener("click", () => {
        // This triggers Auth0's /login route
        window.location.href = "/login";
      });
    }
  });
  