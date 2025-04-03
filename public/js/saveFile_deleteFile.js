// Function to save the game state to MongoDB
function saveGameToServer() {
  // 1) Build a gameData object with the user’s stats:
  const gameData = {
    cakes: player.cakes,
    cakesPerSecond: player.cakesPerSecond,
    cakesPerClick: player.cakesPerClick,
    resources: {
      cursor: cursor.earned,
      farmer: farmer.earned,
      // ...
    },
    achievements: achievements,
    rebirthCount: rebirthCount,
    upgradesPurchased: upgradesList
  };

  // 2) Send this JSON to the server with a POST /api/saveGame
  fetch("/api/saveGame", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameData })
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    })
    .then((data) => {
      console.log(data.message); // e.g. "Game data saved successfully"
    })
    .catch((err) => {
      console.error("Error saving:", err);
    });
}

  
// Function to load the game state from localStorage
async function loadGameFromServer() {
    try {
      const response = await fetch("/api/loadGame");
      if (!response.ok) {
        throw new Error("Failed to load game from server");
      }
  
      const serverData = await response.json();
      // serverData might be {}, or an object with the structure:
      // {
      //   cakes: 100,
      //   cakesPerSecond: 5,
      //   cakesPerClick: 1,
      //   resources: { ... },
      //   achievements: [...],
      //   ...
      // }
  
      // Apply to your local variables
      player.cakes = serverData.cakes || 0;
      player.cakesPerSecond = serverData.cakesPerSecond || 0;
      player.cakesPerClick = serverData.cakesPerClick || 1;
  
      cursor.earned = serverData.resources?.cursor || 0;
      farmer.earned = serverData.resources?.farmer || 0;
      cow.earned = serverData.resources?.cow || 0;
      chicken.earned = serverData.resources?.chicken || 0;
      sugarMaster.earned = serverData.resources?.sugarMaster || 0;
      baker.earned = serverData.resources?.baker || 0;
  
      achievements = serverData.achievements || [];
      rebirthCount = serverData.rebirthCount || 0;
      upgradesList = serverData.upgradesPurchased || [];
  
      // Now update your UI to reflect loaded data
      updateStats();
      updateCakeCount();
  
      console.log("Game loaded from server!");
    } catch (error) {
      console.error("Error loading game from server:", error);
    }
  }
  
  

// Function to start auto-saving at regular intervals
function startAutoSave() {
  setInterval(saveGameToServer, 5000); // every 5 seconds
}

document.addEventListener("DOMContentLoaded", async () => {
  // Load from server once user hits the page
  await loadGameFromServer();

  // Start an interval to auto-save 
  setInterval(() => {
    saveGameToServer();
  }, 30000); // e.g., save every 30s
});

// Initialize the game state on page load
document.addEventListener("DOMContentLoaded", () => {
    loadGameState(); // Load game state on page load
    updateStats(); // Update stats to reflect the loaded state
    updateCakeCount(); // Update the cake count display
    startAutoSave(); // Start auto-save process
});

// Function to wipe the save data
function wipeSave() {
    if (confirm("Are you sure you want to delete your save? This action cannot be undone.")) {
        localStorage.removeItem("cakeClickerSave");
        location.reload(); // Reload the page to reset the game
    }
}
