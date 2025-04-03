// Function to save the game state to MongoDB
async function saveGameToServer() {
    try {
      // Mirror the shape of your "gameData" in the schema
      const gameData = {
        cakes: player.cakes,
        cakesPerSecond: player.cakesPerSecond,
        cakesPerClick: player.cakesPerClick,
        resources: {
          cursor: cursor.earned,
          farmer: farmer.earned,
          cow: cow.earned,
          chicken: chicken.earned,
          sugarMaster: sugarMaster.earned,
          baker: baker.earned
          // ... more as needed
        },
        achievements: achievements,      // if you have an achievements array
        rebirthCount: rebirthCount,      // if you track rebirths
        upgradesPurchased: upgradesList  // or whatever your code calls it
      };
  
      const response = await fetch("/api/saveGame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ gameData })
      });
      
      if (!response.ok) {
        throw new Error("Failed to save game data to server");
      }
  
      const data = await response.json();
      console.log(data.message); // e.g. "Game data saved successfully"
    } catch (error) {
      console.error("Error saving game to server:", error);
    }
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
    setInterval(saveGameState, 5000); // Save the game every 5 seconds
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
