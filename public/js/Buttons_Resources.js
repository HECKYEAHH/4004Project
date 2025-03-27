
function startIncrementing() {
    setInterval(() => {
        player.cakes += player.cakesPerSecond; // Increment the variable
        updateStats();
        updateCakeCount();
    }, 1000); // 1000 ms = 1 second
}

// Start the incrementing process
startIncrementing();

const originalLeftContent = document.getElementById("left").innerHTML;

   let isOptionsOpen = false;
   let isStatsOpen = false;

   function OptionToggle() {
      if (isOptionsOpen) {
         document.getElementById("left").innerHTML = originalLeftContent;
         isOptionsOpen = false;
      } else {
         document.getElementById("left").innerHTML = `
            <div>
               <h2>Options</h2>
               <h2>Save</h2>
               <h2>Wipe save</h2>
            </div>
            <div>
               <h2>Settings</h2>
               <h2>Volume</h2>
               <h2>Other settings</h2>
            </div>`;
         isOptionsOpen = true;
         isStatsOpen = false;
      }
   }

   function StatsToggle() {
      if (isStatsOpen) {
         document.getElementById("left").innerHTML = originalLeftContent;
         isStatsOpen = false;
      } else {
         document.getElementById("left").innerHTML = `
            <div>
               <h2>Statistics</h2>
               <h2>Basic game stats</h2>
               <h2>Leaderboard</h2>
            </div>
            <div>
               <h2>Upgrades</h2>
               <h3>List of upgrades/types of cakes</h3>
            </div>
            <div>
               <h2>List of achievements</h2>
            </div>`;
         isStatsOpen = true;
         isOptionsOpen = false;
      }
   }

// Resource object constructor
function Resource(name, description, baseCost, cps) {
    this.name = name;
    this.description = description;
    this.earned = 0;
    this.baseCost = baseCost; // Starting cost
    this.currentCost = baseCost; // Current cost, increases with purchases
    this.cakesPerSecond = cps; // Cakes generated per second
    this.increment = function (amount) {
        this.earned += amount;
    };
    this.increaseCost = function () {
        this.currentCost = Math.ceil(this.currentCost * 1.5); // Increase cost by 1.5%
    };
}

// Button object constructor
function Button(name, description, onClickFunction) {
    this.name = name;
    this.description = description;
    this.onClick = onClickFunction;
}

// Player object with initial settings
let player = {
    cakesPerClick: 1, // Starts at 1 cake per click
    cakes: 0,
    cakesPerSecond: 0 // Starts with 0 passive cakes per second
};

// Define costs and CPS percentages for each tier
const tier = {
    standard: { cost: 100, cpsMultiplier: 1.1 },
    stone: { cost: 500, cpsMultiplier: 1.2 },
    iron: { cost: 2000, cpsMultiplier: 1.5 },
    gold: { cost: 5000, cpsMultiplier: 2 },
    diamond: { cost: 10000, cpsMultiplier: 3 }
};

function createTieredResource(name, baseDescription, tierName) {
    if (!tier[tierName]) {
        throw new Error(`Tier "${tierName}" is not defined in the tier object.`);
    }
    return new Resource(
        `${name} (${tierName})`,
        `${baseDescription} (${tierName})`,
        tier[tierName].cost,
        tier[tierName].cpsMultiplier
    );
}


// Global resources
let cake = new Resource("Cake", "These are the cakes you clicked!");
let cursor = new Resource("Cursor", "These cursors generate 1 cake per second.", 10, 1);
let farmer = new Resource("Farmer", "These are the farmers hired to grow more crops.", 100, 2);
let cow = new Resource("Cow", "These are the cows that produce the milk for your cake.", 500, 5);
let chicken = new Resource("Chicken", "These are the chickens that create eggs for your cake.", 1000, 10);
let sugarMaster = new Resource("Sugar Master", "These are the sugar experts who will elevate your cake.", 3000, 20);
let baker = new Resource("Baker", "These are the bakers who prepare your cake.", 5000, 50);

// Function to handle cake click (make sure this is global for HTML access)
function clickCake() {
    player.cakes += player.cakesPerClick;
    cake.increment(player.cakesPerClick);
    updateStats();
    updateCakeCount();
}


function updateCakeCount() {
    document.getElementById("cake").innerHTML = `${player.cakes} cakes`;
}

function applyTieredUpgrade(itemName, baseCost, cpsIncreasePercent, tierMultiplier) {
    console.log(`Attempting upgrade: ${itemName}, Cost: ${baseCost}, CPS Increase: ${cpsIncreasePercent}, Multiplier: ${tierMultiplier}`);
    console.log(`Current cakes: ${player.cakes}, Current CPS: ${player.cakesPerSecond}`);
    if (player.cakes >= baseCost) {
        player.cakes -= baseCost;
        const tierEffect = cpsIncreasePercent * tierMultiplier;
        player.cakesPerSecond *= (1 + tierEffect / 100);
        console.log(`Upgrade successful. New CPS: ${player.cakesPerSecond}`);
        alert(`${itemName} applied! CPS increased by ${tierEffect}%.`);
        updateStats();
    } else {
        console.log(`Insufficient cakes for upgrade: ${itemName}`);
        alert(`You need ${baseCost} cakes to purchase ${itemName}.`);
    }
}


// Function to create tiered upgrade handlers
function createTieredUpgrade(name, baseCost, cpsIncreasePercent, tierMultiplier) {
    return function () {
        applyTieredUpgrade(name, baseCost, cpsIncreasePercent, tierMultiplier);
    };
}


/*
// Define tiered upgrades for Hoes
const upgradeHoeStandard = createTieredUpgrade("Hoe (Standard)", 100, 5, 1);
const upgradeHoeStone = createTieredUpgrade("Hoe (Stone)", 500, 5, 2);
const upgradeHoeIron = createTieredUpgrade("Hoe (Iron)", 2000, 5, 3);
const upgradeHoeGold = createTieredUpgrade("Hoe (Gold)", 5000, 5, 4);
const upgradeHoeDiamond = createTieredUpgrade("Hoe (Diamond)", 10000, 5, 5);

// Define tiered upgrades for Water Buckets
const upgradeBucketStandard = createTieredUpgrade("Water Bucket (Standard)", 150, 4, 1);
const upgradeBucketStone = createTieredUpgrade("Water Bucket (Stone)", 600, 4, 2);
const upgradeBucketIron = createTieredUpgrade("Water Bucket (Iron)", 2500, 4, 3);
const upgradeBucketGold = createTieredUpgrade("Water Bucket (Gold)", 6000, 4, 4);
const upgradeBucketDiamond = createTieredUpgrade("Water Bucket (Diamond)", 12000, 4, 5);

// Define tiered upgrades for Milk Bottles
const upgradeMilkStandard = createTieredUpgrade("Milk Bottle (Standard)", 200, 6, 1);
const upgradeMilkStone = createTieredUpgrade("Milk Bottle (Stone)", 700, 6, 2);
const upgradeMilkIron = createTieredUpgrade("Milk Bottle (Iron)", 3000, 6, 3);
const upgradeMilkGold = createTieredUpgrade("Milk Bottle (Gold)", 7500, 6, 4);
const upgradeMilkDiamond = createTieredUpgrade("Milk Bottle (Diamond)", 15000, 6, 5);

// Define tiered upgrades for Furnaces
const upgradeFurnaceStandard = createTieredUpgrade("Furnace (Standard)", 250, 7, 1);
const upgradeFurnaceStone = createTieredUpgrade("Furnace (Stone)", 800, 7, 2);
const upgradeFurnaceIron = createTieredUpgrade("Furnace (Iron)", 3500, 7, 3);
const upgradeFurnaceGold = createTieredUpgrade("Furnace (Gold)", 8500, 7, 4);
const upgradeFurnaceDiamond = createTieredUpgrade("Furnace (Diamond)", 17000, 7, 5); */



document.addEventListener("DOMContentLoaded", () => {
    // Attach event listeners for upgrades
    const attachListener = (id, handler) => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`Attaching listener to: ${id}`);
            element.addEventListener("click", handler);
        } else {
            console.warn(`Element with ID "${id}" not found in the DOM.`);
        }
    };


    // Hoes
    attachListener("hoeStandard", upgradeHoeStandard);
    attachListener("hoeStone", upgradeHoeStone);
    attachListener("hoeIron", upgradeHoeIron);
    attachListener("hoeGold", upgradeHoeGold);
    attachListener("hoeDiamond", upgradeHoeDiamond);

    // Water Buckets
    attachListener("bucketStandard", upgradeBucketStandard);
    attachListener("bucketStone", upgradeBucketStone);
    attachListener("bucketIron", upgradeBucketIron);
    attachListener("bucketGold", upgradeBucketGold);
    attachListener("bucketDiamond", upgradeBucketDiamond);

    // Milk Bottles
    attachListener("milkStandard", upgradeMilkStandard);
    attachListener("milkStone", upgradeMilkStone);
    attachListener("milkIron", upgradeMilkIron);
    attachListener("milkGold", upgradeMilkGold);
    attachListener("milkDiamond", upgradeMilkDiamond);

    // Furnaces
    attachListener("furnaceStandard", upgradeFurnaceStandard);
    attachListener("furnaceStone", upgradeFurnaceStone);
    attachListener("furnaceIron", upgradeFurnaceIron);
    attachListener("furnaceGold", upgradeFurnaceGold);
    attachListener("furnaceDiamond", upgradeFurnaceDiamond);
});

// Upgrade handlers for Hoes
function upgradeHoeStandard() {
    applyTieredUpgrade("Hoe (Standard)", 100, 5, 1);
}
function upgradeHoeStone() {
    applyTieredUpgrade("Hoe (Stone)", 500, 5, 2);
}
function upgradeHoeIron() {
    applyTieredUpgrade("Hoe (Iron)", 2000, 5, 3);
}
function upgradeHoeGold() {
    applyTieredUpgrade("Hoe (Gold)", 5000, 5, 4);
}
function upgradeHoeDiamond() {
    applyTieredUpgrade("Hoe (Diamond)", 10000, 5, 5);
}

// Upgrade handlers for Water Buckets
function upgradeBucketStandard() {
    applyTieredUpgrade("Water Bucket (Standard)", 150, 4, 1);
}
function upgradeBucketStone() {
    applyTieredUpgrade("Water Bucket (Stone)", 600, 4, 2);
}
function upgradeBucketIron() {
    applyTieredUpgrade("Water Bucket (Iron)", 2500, 4, 3);
}
function upgradeBucketGold() {
    applyTieredUpgrade("Water Bucket (Gold)", 6000, 4, 4);
}
function upgradeBucketDiamond() {
    applyTieredUpgrade("Water Bucket (Diamond)", 12000, 4, 5);
}

// Upgrade handlers for Milk Bottles
function upgradeMilkStandard() {
    applyTieredUpgrade("Milk Bottle (Standard)", 200, 6, 1);
}
function upgradeMilkStone() {
    applyTieredUpgrade("Milk Bottle (Stone)", 700, 6, 2);
}
function upgradeMilkIron() {
    applyTieredUpgrade("Milk Bottle (Iron)", 3000, 6, 3);
}
function upgradeMilkGold() {
    applyTieredUpgrade("Milk Bottle (Gold)", 7500, 6, 4);
}
function upgradeMilkDiamond() {
    applyTieredUpgrade("Milk Bottle (Diamond)", 15000, 6, 5);
}

// Upgrade handlers for Furnaces
function upgradeFurnaceStandard() {
    applyTieredUpgrade("Furnace (Standard)", 250, 7, 1);
}
function upgradeFurnaceStone() {
    applyTieredUpgrade("Furnace (Stone)", 800, 7, 2);
}
function upgradeFurnaceIron() {
    applyTieredUpgrade("Furnace (Iron)", 3500, 7, 3);
}
function upgradeFurnaceGold() {
    applyTieredUpgrade("Furnace (Gold)", 8500, 7, 4);
}
function upgradeFurnaceDiamond() {
    applyTieredUpgrade("Furnace (Diamond)", 17000, 7, 5);
}

// Purchase function for store items
function purchaseItem(item) {
    if (player.cakes >= item.currentCost) {
        player.cakes -= item.currentCost;
        item.increment(1);
        player.cakesPerSecond += item.cakesPerSecond;
        document.getElementById("cps").innerHTML = `${player.cakesPerSecond} cakes per second`;
        item.increaseCost();
        updateStats();
    } else {
        alert(`You need ${item.currentCost} cakes to purchase a ${item.name}.`);
    }
}

// Buttons for purchasing resources
let cursorButton = new Button("Cursor", `Costs ${cursor.baseCost} cakes, generates ${cursor.cakesPerSecond} cake per second.`);

function clickCursor() {
    purchaseItem(cursor);
    document.getElementById("cursor").innerHTML = `${cursor.earned} Cursors`;
};

let farmersButton = new Button("Farmer", `Costs ${farmer.baseCost} cakes, generates ${farmer.cakesPerSecond} cakes per second.`);

function clickFarmer() {
    purchaseItem(farmer);
    document.getElementById("farmer").innerHTML = `${farmer.earned} Farmers`;
};

let cowsButton = new Button("Cow", `Costs ${cow.baseCost} cakes, generates ${cow.cakesPerSecond} cakes per second.`);

function clickCow () {
    purchaseItem(cow);
    document.getElementById("cow").innerHTML = `${cow.earned} Cows`;
};

let chickensButton = new Button("Chicken", `Costs ${chicken.baseCost} cakes, generates ${chicken.cakesPerSecond} cakes per second.`);
    function clickChicken() {
    purchaseItem(chicken);
    document.getElementById("chicken").innerHTML = `${chicken.earned} Chickens`;
};

let sugarMastersButton = new Button("Sugar Master", `Costs ${sugarMaster.baseCost} cakes, generates ${sugarMaster.cakesPerSecond} cakes per second.`)
    function clickMaster() {
    purchaseItem(sugarMaster);
    document.getElementById("sugar").innerHTML = `${sugarMaster.earned} Sugar Masters`;
};

let bakersButton = new Button("Baker", `Costs ${baker.baseCost} cakes, generates ${baker.cakesPerSecond} cakes per second.`) 
    function clickBaker() {
    purchaseItem(baker);
    document.getElementById("baker").innerHTML = `${baker.earned} Bakers`;
};

// Buttons for purchasing new tiered resources for Hoes
let hoeStandardButton = new Button("Hoe (Standard)", `Costs ${hoeStandard.baseCost} cakes, generates ${hoeStandard.cakesPerSecond} cakes per second.`);
function clickHoeStandard() {
    purchaseItem(hoeStandard);
}

let hoeStoneButton = new Button("Hoe (Stone)", `Costs ${hoeStone.baseCost} cakes, generates ${hoeStone.cakesPerSecond} cakes per second.`);
function clickHoeStone() {
    purchaseItem(hoeStone);
}

let hoeIronButton = new Button("Hoe (Iron)", `Costs ${hoeIron.baseCost} cakes, generates ${hoeIron.cakesPerSecond} cakes per second.`);
function clickHoeIron() {
    purchaseItem(hoeIron);
}

let hoeGoldButton = new Button("Hoe (Gold)", `Costs ${hoeGold.baseCost} cakes, generates ${hoeGold.cakesPerSecond} cakes per second.`);
function clickHoeGold() {
    purchaseItem(hoeGold);
}

let hoeDiamondButton = new Button("Hoe (Diamond)", `Costs ${hoeDiamond.baseCost} cakes, generates ${hoeDiamond.cakesPerSecond} cakes per second.`);
function clickHoeDiamond() {
    purchaseItem(hoeDiamond);
}

// Buttons for purchasing Water Buckets with tiers
let waterBucketStandardButton = new Button("Water Bucket (Standard)", `Costs ${waterBucketStandard.baseCost} cakes, generates ${waterBucketStandard.cakesPerSecond} cakes per second.`);
function clickWaterBucketStandard() {
    purchaseItem(waterBucketStandard);
}

let waterBucketStoneButton = new Button("Water Bucket (Stone)", `Costs ${waterBucketStone.baseCost} cakes, generates ${waterBucketStone.cakesPerSecond} cakes per second.`);
function clickWaterBucketStone() {
    purchaseItem(waterBucketStone);
}

let waterBucketIronButton = new Button("Water Bucket (Iron)", `Costs ${waterBucketIron.baseCost} cakes, generates ${waterBucketIron.cakesPerSecond} cakes per second.`);
function clickWaterBucketIron() {
    purchaseItem(waterBucketIron);
}

let waterBucketGoldButton = new Button("Water Bucket (Gold)", `Costs ${waterBucketGold.baseCost} cakes, generates ${waterBucketGold.cakesPerSecond} cakes per second.`);
function clickWaterBucketGold() {
    purchaseItem(waterBucketGold);
}

let waterBucketDiamondButton = new Button("Water Bucket (Diamond)", `Costs ${waterBucketDiamond.baseCost} cakes, generates ${waterBucketDiamond.cakesPerSecond} cakes per second.`);
function clickWaterBucketDiamond() {
    purchaseItem(waterBucketDiamond);
}

// Buttons for purchasing Milk Bottles with tiers
let milkBottleStandardButton = new Button("Milk Bottle (Standard)", `Costs ${milkBottleStandard.baseCost} cakes, generates ${milkBottleStandard.cakesPerSecond} cakes per second.`);
function clickMilkBottleStandard() {
    purchaseItem(milkBottleStandard);
}

let milkBottleStoneButton = new Button("Milk Bottle (Stone)", `Costs ${milkBottleStone.baseCost} cakes, generates ${milkBottleStone.cakesPerSecond} cakes per second.`);
function clickMilkBottleStone() {
    purchaseItem(milkBottleStone);
}

let milkBottleIronButton = new Button("Milk Bottle (Iron)", `Costs ${milkBottleIron.baseCost} cakes, generates ${milkBottleIron.cakesPerSecond} cakes per second.`);
function clickMilkBottleIron() {
    purchaseItem(milkBottleIron);
}

let milkBottleGoldButton = new Button("Milk Bottle (Gold)", `Costs ${milkBottleGold.baseCost} cakes, generates ${milkBottleGold.cakesPerSecond} cakes per second.`);
function clickMilkBottleGold() {
    purchaseItem(milkBottleGold);
}

let milkBottleDiamondButton = new Button("Milk Bottle (Diamond)", `Costs ${milkBottleDiamond.baseCost} cakes, generates ${milkBottleDiamond.cakesPerSecond} cakes per second.`);
function clickMilkBottleDiamond() {
    purchaseItem(milkBottleDiamond);
}

// Buttons for purchasing Furnaces with tiers
let furnaceStandardButton = new Button("Furnace (Standard)", `Costs ${furnaceStandard.baseCost} cakes, generates ${furnaceStandard.cakesPerSecond} cakes per second.`);
function clickFurnaceStandard() {
    purchaseItem(furnaceStandard);
}

let furnaceStoneButton = new Button("Furnace (Stone)", `Costs ${furnaceStone.baseCost} cakes, generates ${furnaceStone.cakesPerSecond} cakes per second.`);
function clickFurnaceStone() {
    purchaseItem(furnaceStone);
}

let furnaceIronButton = new Button("Furnace (Iron)", `Costs ${furnaceIron.baseCost} cakes, generates ${furnaceIron.cakesPerSecond} cakes per second.`);
function clickFurnaceIron() {
    purchaseItem(furnaceIron);
}

let furnaceGoldButton = new Button("Furnace (Gold)", `Costs ${furnaceGold.baseCost} cakes, generates ${furnaceGold.cakesPerSecond} cakes per second.`);
function clickFurnaceGold() {
    purchaseItem(furnaceGold);
}

let furnaceDiamondButton = new Button("Furnace (Diamond)", `Costs ${furnaceDiamond.baseCost} cakes, generates ${furnaceDiamond.cakesPerSecond} cakes per second.`);
function clickFurnaceDiamond() {
    purchaseItem(furnaceDiamond);
}

// Upgrade logic for specific resources
function upgradeResource(resource, cakesCost, cakesPerClickIncrease) {
    if (player.cakes >= cakesCost) {
        player.cakes -= cakesCost;
        player.cakesPerClick += cakesPerClickIncrease;
        resource.increment(1);
        alert(`${resource.name} upgraded! Cakes per click increased by ${cakesPerClickIncrease}. Total cakes per click: ${player.cakesPerClick}`);
        updateStats();
    } else {
        alert(`You need ${cakesCost} cakes to upgrade ${resource.name}.`);
    }
}

// Statistics Button for viewing stats in console
let statsButton = new Button("Statistics", "View CakeClicker stats", function () {
    console.log("Statistics button clicked");
    displayStats();
});

// Display resources and stats in the console
function displayStats() {
    console.log(`Cakes: ${cake.earned}`);
    console.log(`Cursors: ${cursor.earned} (Cost: ${cursor.currentCost}, CPS: ${cursor.cakesPerSecond})`);
    console.log(`Farmers: ${farmer.earned} (Cost: ${farmer.currentCost}, CPS: ${farmer.cakesPerSecond})`);
    console.log(`Cows: ${cow.earned} (Cost: ${cow.currentCost}, CPS: ${cow.cakesPerSecond})`);
    console.log(`Chickens: ${chicken.earned} (Cost: ${chicken.currentCost}, CPS: ${chicken.cakesPerSecond})`);
    console.log(`Sugar Masters: ${sugarMaster.earned} (Cost: ${sugarMaster.currentCost}, CPS: ${sugarMaster.cakesPerSecond})`);
    console.log(`Bakers: ${baker.earned} (Cost: ${baker.currentCost}, CPS: ${baker.cakesPerSecond})`);
    console.log(`Total cakes per click: ${player.cakesPerClick}`);
    console.log(`Total cakes per second: ${player.cakesPerSecond}`);
    console.log(`Total cakes: ${player.cakes}`);
}

// Function to update stats on the screen
function updateStats() {
    document.getElementById("cake").innerText = `${player.cakes} cakes`;
    displayStats();
}



// Initialize the game and start passive generation
updateStats();
