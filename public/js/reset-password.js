document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    document.getElementById("resetPasswordForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        const newPassword = document.getElementById("newPassword").value;

        fetch("/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                window.location.href = "/";
            }
        })
        .catch(error => console.error("Error:", error));
    });
});
