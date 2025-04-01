// Save and Load Functions for Idle Game Progress

// Function to save game data to localStorage
function saveGame() {
    const gameData = {
        cakes: player.cakes,
        cakesPerClick: player.cakesPerClick,
        passiveCakesPerSecond: player.passiveCakesPerSecond,
        equipmentLevels: {
            furnace: equipment.furnace.level,
            waterBucket: equipment.waterBucket.level,
            milkBottle: equipment.milkBottle.level,
            hoe: equipment.hoe.level
        }
    };

    localStorage.setItem("idleGameSave", JSON.stringify(gameData));
    console.log("Game saved!");
}

// Function to load game data from localStorage
function loadGame() {
    const savedData = JSON.parse(localStorage.getItem("idleGameSave"));

    if (savedData) {
        // Restore player state
        player.cakes = savedData.cakes || 0;
        player.cakesPerClick = savedData.cakesPerClick || 1;
        player.passiveCakesPerSecond = savedData.passiveCakesPerSecond || 0;

        // Restore equipment levels and passive cakes per second
        if (savedData.equipmentLevels) {
            equipment.furnace.level = savedData.equipmentLevels.furnace || 0;
            equipment.waterBucket.level = savedData.equipmentLevels.waterBucket || 0;
            equipment.milkBottle.level = savedData.equipmentLevels.milkBottle || 0;
            equipment.hoe.level = savedData.equipmentLevels.hoe || 0;

            // Update each equipment's passive cakes per second based on restored levels
            for (let item in equipment) {
                let level = equipment[item].level;
                equipment[item].passiveCakes = tierLevels[level].cakesPerSecond;
            }

            // Recalculate total passive cakes per second
            updatePassiveCakesPerSecond();
        }

        console.log("Game loaded!");
        updateStats();
    } else {
        console.log("No save data found.");
    }
}

// Function to wipe save data from localStorage
function wipeSave() {
    localStorage.removeItem("idleGameSave");
    console.log("Game data wiped.");
    location.reload(); // Optionally reload page to reset state
}

// Auto-save game progress every 30 seconds
setInterval(saveGame, 30000);

// Add Save, Load, and Wipe Save Button Functionality
document.getElementById("saveButton").addEventListener("click", saveGame);
document.getElementById("loadButton").addEventListener("click", loadGame);
document.getElementById("wipeSaveButton").addEventListener("click", wipeSave);

// Load game data when the page loads
window.onload = loadGame;
