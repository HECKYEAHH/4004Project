document.getElementById('forgotPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const messageElement = document.getElementById('message');

    fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            messageElement.textContent = 'Password reset email sent. Please check your inbox.';
            messageElement.className = 'success';
        } else {
            messageElement.textContent = 'Error: ' + data.message;
            messageElement.className = 'error';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        messageElement.textContent = 'An error occurred. Please try again later.';
        messageElement.className = 'error';
    });
});