// public/js/profile.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
      // 1) Call your /api/me endpoint
      const res = await fetch('/api/me');
      if (!res.ok) {
        throw new Error('Not logged in or no data found');
      }
  
      // 2) Extract the user object
      const userData = await res.json();
      // userData might look like:
      // {
      //   nickname: "Bob",
      //   gold: 100,
      //   minecraftUsername: "Notch",
      //   minecraftAvatarURL: "https://playerdb.co/avatar/minecraft/Notch"
      // }
  
      // 3) Display the user info
      const usernameDisplay = document.getElementById('usernameDisplay');
      if (usernameDisplay) {
        usernameDisplay.textContent = userData.minecraftUsername || userData.nickname || 'Unknown User';
      }
  
      const playerHead = document.getElementById('playerHead');
      if (playerHead && userData.minecraftAvatarURL) {
        // If we have the MC avatar URL, set <img src=...>
        playerHead.src = userData.minecraftAvatarURL;
      }
    } catch (err) {
      console.error(err);
      // Optional: redirect to home or show an error message
    }
  });
  