// public/js/fetchUsername.js
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/me');
    if (!res.ok) {
      throw new Error('Not logged in or /api/me failed');
    }
    const data = await res.json();

    // data: { nickname, gold, minecraftUsername, minecraftAvatarURL }
    const usernameDisplay = document.getElementById('usernameDisplay');
    const playerHead = document.getElementById('playerHead');

    if (usernameDisplay) {
      usernameDisplay.textContent = data.minecraftUsername || data.nickname || 'Unknown User';
    }
    if (playerHead && data.minecraftAvatarURL) {
      playerHead.src = data.minecraftAvatarURL;
    }
  } catch (err) {
    console.error(err);
  }
});
