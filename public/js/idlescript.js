document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = 'index.html'; // Redirect back to login if no username
    }

    document.getElementById('usernameDisplay').textContent = username;

    const bit = document.querySelector('.bit-cost');
    const bpcText = document.getElementById("bpc-text");
    const bpsText = document.getElementById("bps-text");
    const ssdCardsText = document.getElementById("ssd-cards");
    const rebirthCostText = document.getElementById("rebirthCostText");
    const bitImgContainer = document.querySelector('.bit-img-container');

    let parsedBit = parseFloat(bit.innerHTML) || 0;
    let bpc = 1;
    let bps = 0;
    let clickCounter = 0;
    let ssdCards = 0;
    let rebirthCost = 1000000; // Initial high cost for rebirth

    // Added variables for statistics
    let totalClicks = 0;
    let totalRebirths = 0;
    let totalUpgrades = 0;
    let totalBitsObtained = 0;
    let totalBitsSpent = 0;

    const upgrades = [
        createUpgrade('clicker', ".basicbitcost", ".clicker-level", ".clicker-increase", 1.03, 1.12, 10, 1),
        createUpgrade('basicBitFarm', ".basicbitfarm", ".basicbitfarm-level", ".basicbitfarm-increase", 1.03, 1.115, 150, 4),
        createUpgrade('basicLogicGate', ".basiclogicgate", ".basiclogicgate-level", ".basiclogicgate-increase", 1.035, 1.11, 850, 24),
        createUpgrade('RAM Stick', ".ramStick", ".ramStick-level", ".ramStick-increase", 1.04, 1.10, 4750, 82)
    ];

    const achievements = [
        createAchievement(1, 'First Click', 'Make your first click!', 'https://img.icons8.com/?size=100&id=12345&format=png', 0.1),
        createAchievement(2, '100 Clicks', 'Make 100 clicks!', 'https://img.icons8.com/?size=100&id=67890&format=png', 0.5)
    ];

    const notification = createNotificationElement();
    document.body.appendChild(notification);

    initializeEventListeners();
    initializeMenuButtons();
    setInterval(updateGame, 100);

    // Sample leaderboard data
    const leaderboardData = [
        { name: 'John Doe', totalEarnings: 100000, totalClicks: 1000, totalRebirths: 10, totalUpgrades: 50 },
        { name: 'Jane Smith', totalEarnings: 95000, totalClicks: 900, totalRebirths: 9, totalUpgrades: 45 },
        { name: 'Emily Johnson', totalEarnings: 90000, totalClicks: 800, totalRebirths: 8, totalUpgrades: 40 }
    ];

    // Function to save leaderboard data to local storage
    function saveLeaderboard(data) {
        localStorage.setItem('leaderboard', JSON.stringify(data));
    }

    // Function to load leaderboard data from local storage
    function loadLeaderboard() {
        const data = localStorage.getItem('leaderboard');
        return data ? JSON.parse(data) : [];
    }

    // Function to update leaderboard UI
    function updateLeaderboardUI() {
        const leaderboard = loadLeaderboard();
        const leaderboardEntries = document.getElementById('leaderboard-entries');
        leaderboardEntries.innerHTML = '';

        leaderboard.sort((a, b) => b.totalEarnings - a.totalEarnings);

        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            const rankCell = document.createElement('td');
            const nameCell = document.createElement('td');
            const totalEarningsCell = document.createElement('td');
            const totalClicksCell = document.createElement('td');
            const totalRebirthsCell = document.createElement('td');
            const totalUpgradesCell = document.createElement('td');

            rankCell.textContent = index + 1;
            nameCell.textContent = entry.name;
            totalEarningsCell.textContent = entry.totalEarnings;
            totalClicksCell.textContent = entry.totalClicks;
            totalRebirthsCell.textContent = entry.totalRebirths;
            totalUpgradesCell.textContent = entry.totalUpgrades;

            row.appendChild(rankCell);
            row.appendChild(nameCell);
            row.appendChild(totalEarningsCell);
            row.appendChild(totalClicksCell);
            row.appendChild(totalRebirthsCell);
            row.appendChild(totalUpgradesCell);

            leaderboardEntries.appendChild(row);
        });
    }

    // Initialize leaderboard with sample data (if not already initialized)
    if (!localStorage.getItem('leaderboard')) {
        saveLeaderboard(leaderboardData);
    }

    // Update the leaderboard UI on page load
    document.addEventListener('DOMContentLoaded', updateLeaderboardUI);

    // Example function to add a new score (you can call this function to update the leaderboard)
    function addScore(name, totalEarnings, totalClicks, totalRebirths, totalUpgrades) {
        const leaderboard = loadLeaderboard();
        leaderboard.push({ name, totalEarnings, totalClicks, totalRebirths, totalUpgrades });
        saveLeaderboard(leaderboard);
        updateLeaderboardUI();
    }

    function createUpgrade(name, costSelector, levelSelector, increaseSelector, bitMultiplier, costMultiplier, initialCost, initialIncrease) {
        return {
            name,
            costElement: document.querySelector(costSelector),
            levelElement: document.querySelector(levelSelector),
            increaseElement: document.querySelector(increaseSelector),
            bitMultiplier,
            costMultiplier,
            initialCost,
            initialIncrease,
            parsedCost: parseFloat(document.querySelector(costSelector).innerHTML) || initialCost,
            parsedIncrease: parseFloat(document.querySelector(increaseSelector).innerHTML) || initialIncrease
        };
    }

    function createAchievement(id, name, description, image, boost) {
        return { id, name, description, image, boost, earned: false };
    }

    function createNotificationElement() {
        const notification = document.createElement('div');
        notification.classList.add('achievement-notification');
        return notification;
    }

    function initializeEventListeners() {
        bitImgContainer.addEventListener('click', handleBitClick);
        document.getElementById('achievementsButton').addEventListener('click', () => {
            document.getElementById('achievementsPopup').style.display = 'flex';
            updateAchievementsList();
        });
        document.getElementById('closeAchievements').addEventListener('click', () => {
            document.getElementById('achievementsPopup').style.display = 'none';
        });

        document.querySelector('.buy-clicker').addEventListener('click', () => buyUpgrade(upgrades[0], 'bpc'));
        document.querySelector('.buy-basicbitfarm').addEventListener('click', () => buyUpgrade(upgrades[1], 'bps'));
        document.querySelector('.buy-basiclogicgate').addEventListener('click', () => buyUpgrade(upgrades[2], 'bps'));
        document.querySelector('.buy-ramstick').addEventListener('click', () => buyUpgrade(upgrades[3], 'bps'));

        // Add the following lines to initialize the event listeners for export and import
        const exportSaveButton = document.getElementById('exportSaveButton');
        const importSaveButton = document.getElementById('importSaveButton');
        const exportMenu = document.getElementById('exportMenu');
        const importMenu = document.getElementById('importMenu');
        const closeExportMenu = document.getElementById('closeExportMenu');
        const closeImportMenu = document.getElementById('closeImportMenu');
        const exportTextarea = document.getElementById('exportTextarea');
        const importTextarea = document.getElementById('importTextarea');

        exportSaveButton.addEventListener('click', () => {
            exportMenu.style.display = 'flex';
            exportGameState();
        });

        closeExportMenu.addEventListener('click', () => {
            exportMenu.style.display = 'none';
        });

        importSaveButton.addEventListener('click', () => {
            importMenu.style.display = 'flex';
        });

        closeImportMenu.addEventListener('click', () => {
            importMenu.style.display = 'none';
        });

        importTextarea.addEventListener('paste', (event) => {
            setTimeout(() => {
                importGameState(importTextarea.value);
            }, 100); // Delay to ensure the pasted content is available
        });

        document.getElementById('leaderboardsButton').addEventListener('click', () => {
            document.getElementById('leaderboard').style.display = 'flex';
            updateLeaderboardUI();
        });

        document.getElementById('closeLeaderboard').addEventListener('click', () => {
            document.getElementById('leaderboard').style.display = 'none';
        });

        // Event listeners for stats menu
        document.getElementById('statsButton').addEventListener('click', () => {
            document.getElementById('totalClicks').textContent = totalClicks;
            document.getElementById('totalRebirths').textContent = totalRebirths;
            document.getElementById('totalUpgrades').textContent = totalUpgrades;
            document.getElementById('totalBitsObtained').textContent = Math.round(totalBitsObtained);
            document.getElementById('totalBitsSpent').textContent = Math.round(totalBitsSpent);
            document.getElementById('statsMenu').style.display = 'flex';
        });

        document.getElementById('closeStatsMenu').addEventListener('click', () => {
            document.getElementById('statsMenu').style.display = 'none';
        });
    }

    function handleBitClick(event) {
        parsedBit += bpc;
        bit.innerHTML = Math.round(parsedBit);
        clickCounter++;
        totalClicks++;
        totalBitsObtained = Math.round(totalBitsObtained + bpc); // Rounded to whole number
        checkAchievements();

        const x = event.offsetX;
        const y = event.offsetY;

        const div = document.createElement('div');
        div.innerHTML = `+${Math.round(bpc)}`;
        div.style.cssText = `color: white; position: absolute; top: ${y}px; left: ${x}px; font-size: 15px; pointer-events: none;`;
        bitImgContainer.appendChild(div);

        div.classList.add('fade-up');
        setTimeout(() => {
            bitImgContainer.removeChild(div);
        }, 1000);
    }

    function buyUpgrade(upgrade, type) {
        if (parsedBit >= upgrade.parsedCost) {
            totalBitsSpent = Math.round(totalBitsSpent + upgrade.parsedCost); // Rounded to whole number
            parsedBit -= upgrade.parsedCost;
            bit.innerHTML = Math.round(parsedBit);

            const level = parseInt(upgrade.levelElement.innerHTML) + 1;
            upgrade.levelElement.innerHTML = level;

            const increase = parseFloat((upgrade.parsedIncrease * upgrade.bitMultiplier).toFixed(2));
            upgrade.parsedIncrease = increase;
            upgrade.increaseElement.innerHTML = increase;

            upgrade.parsedCost *= upgrade.costMultiplier;
            upgrade.costElement.innerHTML = Math.round(upgrade.parsedCost);

            if (type === 'bpc') {
                bpc += increase;
            } else {
                bps += increase;
            }

            totalUpgrades++;
        }
    }

    function checkAchievements() {
        achievements.forEach(achievement => {
            if (!achievement.earned) {
                if ((achievement.id === 1 && clickCounter >= 1) || (achievement.id === 2 && clickCounter >= 100)) {
                    achievement.earned = true;
                    bpc += achievement.boost;
                    showAchievementNotification(achievement);
                }
            }
        });
    }

    function showAchievementNotification(achievement) {
        notification.innerText = `Achievement Unlocked: ${achievement.name}`;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    function updateAchievementsList() {
        const achievementsList = document.getElementById('achievementsList');
        achievementsList.innerHTML = '';
        achievements.forEach(achievement => {
            const item = document.createElement('div');
            item.classList.add('achievement-item');
            item.innerHTML = `
                <img src="${achievement.image}" alt="${achievement.name}">
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
                <div class="tooltip">${achievement.description}<br>Boost: +${achievement.boost} BPC</div>
            `;
            item.style.opacity = achievement.earned ? 1 : 0.5;
            achievementsList.appendChild(item);
        });
    }

    function updateGame() {
        parsedBit += bps / 10;
        bit.innerHTML = Math.round(parsedBit);
        bpcText.innerHTML = Math.round(bpc);
        bpsText.innerHTML = Math.round(bps);
    }

    // Menu functionality
    function initializeMenuButtons() {
        const menuButton = document.getElementById('menuButton');
        const menuPopup = document.getElementById('menuPopup');
        const closeMenuButton = document.getElementById('closeMenu');
        const saveProgressButton = document.getElementById('saveProgressButton');
        const saveProgressMenu = document.getElementById('saveProgressMenu');
        const closeSaveMenuButton = document.getElementById('closeSaveMenu');
        const saveSlots = document.querySelectorAll('.save-slot');
        const deleteSlots = document.querySelectorAll('.delete-slot');
        const loadSlots = document.querySelectorAll('.load-slot');
        const saveIntervalInput = document.getElementById('saveInterval');
        const toggleAutosaveButton = document.getElementById('toggleAutosave');
        const resetProgressButton = document.getElementById('resetProgressButton');
        const profileButton = document.getElementById('profileButton');
        const profileMenu = document.getElementById('profileMenu');
        const closeProfileMenuButton = document.getElementById('closeProfileMenu');
        const rebirthButton = document.getElementById('rebirthButton');
        const statsButton = document.getElementById('statsButton');
        const rebirthMenu = document.getElementById('rebirthMenu');
        const closeRebirthMenuButton = document.getElementById('closeRebirthMenu');
        const confirmRebirthButton = document.getElementById('confirmRebirthButton');

        menuButton.addEventListener('click', () => menuPopup.style.display = 'flex');
        closeMenuButton.addEventListener('click', () => menuPopup.style.display = 'none');
        saveProgressButton.addEventListener('click', () => saveProgressMenu.style.display = 'flex');
        closeSaveMenuButton.addEventListener('click', () => saveProgressMenu.style.display = 'none');
        saveSlots.forEach(slot => slot.addEventListener('click', () => saveGameState(slot.getAttribute('data-slot'))));
        loadSlots.forEach(slot => slot.addEventListener('click', () => loadGameState(slot.getAttribute('data-slot'))));
        deleteSlots.forEach(slot => slot.addEventListener('click', () => {
            const slotNumber = slot.getAttribute('data-slot');
            if (confirm(`Are you sure you want to delete save slot ${slotNumber}? This action cannot be undone.`)) {
                deleteSave(slotNumber);
            }
        }));
        resetProgressButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
                resetProgress();
            }
        });
        toggleAutosaveButton.addEventListener('click', toggleAutosave);

        profileButton.addEventListener('click', () => profileMenu.style.display = 'flex');
        closeProfileMenuButton.addEventListener('click', () => profileMenu.style.display = 'none');
        rebirthButton.addEventListener('click', () => {
            rebirthCostText.innerHTML = rebirthCost;
            rebirthMenu.style.display = 'flex';
        });
        closeRebirthMenuButton.addEventListener('click', () => rebirthMenu.style.display = 'none');
        confirmRebirthButton.addEventListener('click', () => {
            if (parsedBit >= rebirthCost) {
                performRebirth();
                rebirthMenu.style.display = 'none';
            } else {
                alert('Not enough bits to rebirth!');
            }
        });
        statsButton.addEventListener('click', () => {
            document.getElementById('totalClicks').textContent = totalClicks;
            document.getElementById('totalRebirths').textContent = totalRebirths;
            document.getElementById('totalUpgrades').textContent = totalUpgrades;
            document.getElementById('totalBitsObtained').textContent = Math.round(totalBitsObtained);
            document.getElementById('totalBitsSpent').textContent = Math.round(totalBitsSpent);
            document.getElementById('statsMenu').style.display = 'flex';
        });

        document.getElementById('closeStatsMenu').addEventListener('click', () => {
            document.getElementById('statsMenu').style.display = 'none';
        });
    }

    function saveGameState(slot) {
        const gameState = {
            bit: parsedBit,
            upgrades: upgrades.map(upgrade => ({
                cost: upgrade.parsedCost,
                level: parseInt(upgrade.levelElement.innerHTML),
                increase: upgrade.parsedIncrease
            })),
            bpc,
            bps,
            ssdCards,
            rebirthCost,
            totalClicks,
            totalRebirths,
            totalUpgrades,
            totalBitsObtained,
            totalBitsSpent
        };
        localStorage.setItem(`bitClickerSaveSlot${slot}`, JSON.stringify(gameState));
        alert(`Game saved to slot ${slot}`);
    }

    function loadGameState(slot) {
        const gameState = localStorage.getItem(`bitClickerSaveSlot${slot}`);
        if (gameState) {
            const state = JSON.parse(gameState);
            parsedBit = state.bit;
            bit.innerHTML = Math.round(parsedBit);

            state.upgrades.forEach((upgradeState, index) => {
                upgrades[index].parsedCost = upgradeState.cost;
                upgrades[index].costElement.innerHTML = Math.round(upgradeState.cost);
                upgrades[index].levelElement.innerHTML = upgradeState.level;
                upgrades[index].parsedIncrease = upgradeState.increase;
                upgrades[index].increaseElement.innerHTML = upgradeState.increase;
            });

            bpc = state.bpc;
            bps = state.bps;
            ssdCards = state.ssdCards;
            ssdCardsText.innerHTML = ssdCards;
            rebirthCost = state.rebirthCost;

            // Load statistics
            totalClicks = state.totalClicks || 0;
            totalRebirths = state.totalRebirths || 0;
            totalUpgrades = state.totalUpgrades || 0;
            totalBitsObtained = state.totalBitsObtained || 0;
            totalBitsSpent = state.totalBitsSpent || 0;

            alert(`Game loaded from slot ${slot}`);
        } else {
            alert(`No save found in slot ${slot}`);
        }
    }

    function deleteSave(slot) {
        localStorage.removeItem(`bitClickerSaveSlot${slot}`);
        alert(`Save slot ${slot} deleted`);
    }

    function resetProgress(fullReset = true) {
        parsedBit = 0;
        bit.innerHTML = parsedBit;

        upgrades.forEach(upgrade => {
            upgrade.parsedCost = upgrade.initialCost;
            upgrade.costElement.innerHTML = Math.round(upgrade.initialCost);
            upgrade.levelElement.innerHTML = 1;
            upgrade.parsedIncrease = upgrade.initialIncrease;
            upgrade.increaseElement.innerHTML = upgrade.initialIncrease;
        });

        bpc = 1;
        bps = 0;
        clickCounter = 0;

        if (fullReset) {
            ssdCards = 0;
            rebirthCost = 1000000;
            ssdCardsText.innerHTML = ssdCards;
            localStorage.removeItem('bitClickerGameState');
            alert('Progress reset!');
        }

        // Reset statistics
        totalClicks = 0;
        totalRebirths = 0;
        totalUpgrades = 0;
        totalBitsObtained = 0;
        totalBitsSpent = 0;
    }

    function toggleAutosave() {
        autosaveEnabled = !autosaveEnabled;
        if (autosaveEnabled) {
            const interval = parseInt(document.getElementById('saveInterval').value) || 60;
            autosaveInterval = setInterval(() => saveGameState('autosave'), interval * 1000);
            alert(`Autosave enabled. Saving every ${interval} seconds.`);
        } else {
            clearInterval(autosaveInterval);
            alert('Autosave disabled.');
        }
    }

    function performRebirth() {
        // Deduct the rebirth cost
        parsedBit -= rebirthCost;
        bit.innerHTML = Math.round(parsedBit);

        // Increase rebirth cost for next time
        rebirthCost *= 2;

        // Grant an SSD Card
        ssdCards++;
        ssdCardsText.innerHTML = ssdCards;

        // Reset game state (except SSD Cards)
        resetProgress(false);

        totalRebirths++;

        alert('Rebirth successful! You earned an SSD Card.');
    }

    function loadProgress() {
        const gameState = localStorage.getItem('bitClickerSaveSlotautosave');
        if (gameState) {
            const state = JSON.parse(gameState);
            parsedBit = state.bit;
            bit.innerHTML = Math.round(parsedBit);

            state.upgrades.forEach((upgradeState, index) => {
                upgrades[index].parsedCost = upgradeState.cost;
                upgrades[index].costElement.innerHTML = Math.round(upgradeState.cost);
                upgrades[index].levelElement.innerHTML = upgradeState.level;
                upgrades[index].parsedIncrease = upgradeState.increase;
                upgrades[index].increaseElement.innerHTML = upgradeState.increase;
            });

            bpc = state.bpc;
            bps = state.bps;
            ssdCards = state.ssdCards;
            ssdCardsText.innerHTML = ssdCards;
            rebirthCost = state.rebirthCost;

            // Load statistics
            totalClicks = state.totalClicks || 0;
            totalRebirths = state.totalRebirths || 0;
            totalUpgrades = state.totalUpgrades || 0;
            totalBitsObtained = state.totalBitsObtained || 0;
            totalBitsSpent = state.totalBitsSpent || 0;
        }
    }

    // Export and Import functionality
    function exportGameState() {
        const gameState = {
            bit: parsedBit,
            upgrades: upgrades.map(upgrade => ({
                cost: upgrade.parsedCost,
                level: parseInt(upgrade.levelElement.innerHTML),
                increase: upgrade.parsedIncrease
            })),
            bpc,
            bps,
            ssdCards,
            rebirthCost,
            totalClicks,
            totalRebirths,
            totalUpgrades,
            totalBitsObtained,
            totalBitsSpent
        };
        exportTextarea.value = JSON.stringify(gameState);
    }

    function importGameState(data) {
        try {
            const state = JSON.parse(data);
            parsedBit = state.bit;
            bit.innerHTML = Math.round(parsedBit);

            state.upgrades.forEach((upgradeState, index) => {
                upgrades[index].parsedCost = upgradeState.cost;
                upgrades[index].costElement.innerHTML = Math.round(upgradeState.cost);
                upgrades[index].levelElement.innerHTML = upgradeState.level;
                upgrades[index].parsedIncrease = upgradeState.increase;
                upgrades[index].increaseElement.innerHTML = upgradeState.increase;
            });

            bpc = state.bpc;
            bps = state.bps;
            ssdCards = state.ssdCards;
            ssdCardsText.innerHTML = ssdCards;
            rebirthCost = state.rebirthCost;

            // Load statistics
            totalClicks = state.totalClicks || 0;
            totalRebirths = state.totalRebirths || 0;
            totalUpgrades = state.totalUpgrades || 0;
            totalBitsObtained = state.totalBitsObtained || 0;
            totalBitsSpent = state.totalBitsSpent || 0;

            alert('Game state imported successfully!');
            importMenu.style.display = 'none';
        } catch (error) {
            alert('Failed to import game state. Please make sure the data is correct.');
        }
    }
});
