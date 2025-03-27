// Function to save the game state to localStorage
function saveGameState() {
    try {
        const gameState = {
            cakes: player.cakes,
            cakesPerSecond: player.cakesPerSecond,
            cakesPerClick: player.cakesPerClick,
            resources: {
                cursor: cursor.earned,
                farmer: farmer.earned,
                cow: cow.earned,
                chicken: chicken.earned,
                sugarMaster: sugarMaster.earned,
                baker: baker.earned,
            },
        };
        localStorage.setItem("cakeClickerSave", JSON.stringify(gameState));
        console.log("Game saved automatically!");
    } catch (error) {
        console.error("Error saving game:", error);
    }
}

// Function to load the game state from localStorage
function loadGameState() {
    try {
        const savedState = localStorage.getItem("cakeClickerSave");
        if (savedState) {
            const gameState = JSON.parse(savedState);

            // Load player data
            player.cakes = gameState.cakes || 0;
            player.cakesPerSecond = gameState.cakesPerSecond || 0;
            player.cakesPerClick = gameState.cakesPerClick || 1;

            // Load resources
            cursor.earned = gameState.resources?.cursor || 0;
            farmer.earned = gameState.resources?.farmer || 0;
            cow.earned = gameState.resources?.cow || 0;
            chicken.earned = gameState.resources?.chicken || 0;
            sugarMaster.earned = gameState.resources?.sugarMaster || 0;
            baker.earned = gameState.resources?.baker || 0;

            console.log("Game loaded from saved state!");
        } else {
            console.log("No saved game found. Starting a new game.");
        }
    } catch (error) {
        console.error("Error loading game:", error);
    }
}

// Function to start auto-saving at regular intervals
function startAutoSave() {
    setInterval(saveGameState, 5000); // Save the game every 5 seconds
}

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
