/*************************************************
 *  MAIN GAME SETUP
 *************************************************/
function startIncrementing() {
    setInterval(() => {
      // Passive production every second
      player.cakes += player.cakesPerSecond;
      updateStats();
      updateCakeCount();
    }, 1000);
  }
  startIncrementing();
  
  // Track what's in the left panel by default
  const originalLeftContent = document.getElementById("left").innerHTML;
  let isOptionsOpen = false;
  let isStatsOpen = false;
  
  // Toggle the Options menu
  function OptionToggle() {
    if (isOptionsOpen) {
      document.getElementById("left").innerHTML = originalLeftContent;
      isOptionsOpen = false;
    } else {
      document.getElementById("left").innerHTML = `
        <div>
          <h2>Options</h2>
          <h2 onclick="saveGameToServer()" style="cursor: pointer;">Save</h2>
          <h2 onclick="wipeSave()" style="cursor: pointer;">Wipe save</h2>
        </div>
        <div>
          <h2>Settings</h2>
          <h2>Volume</h2>
          <h2>Other settings</h2>
          <h2 onclick="location.href='/logout'" style="cursor: pointer;">Log out</h2>
        </div>`;
      isOptionsOpen = true;
      isStatsOpen = false;
    }
  }
  
  // Toggle the Stats menu
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
  
  /*************************************************
   *  RESOURCE (multi‐purchase) AND BUTTON SETUP
   *************************************************/
  function Resource(name, description, baseCost = 0, cps = 0) {
    this.name = name;
    this.description = description;
    this.earned = 0;
    this.baseCost = baseCost;
    this.currentCost = baseCost;
    this.cakesPerSecond = cps;
    // Increase cost by 50% after each purchase
    this.increaseCost = function () {
      this.currentCost = Math.ceil(this.currentCost * 1.5);
    };
    this.increment = function (count) {
      this.earned += count;
    };
  }
  
  function Button(name, description, onClickFunction) {
    this.name = name;
    this.description = description;
    this.onClick = onClickFunction;
  }
  
  // The player's main stats
  let player = {
    cakesPerClick: 1,
    cakes: 0,
    cakesPerSecond: 0,
    upgradesList: []
  };
  
  // Create your multi‐purchase resources
  let cursor = new Resource("Cursor", "Generates 1 cake/s", 10, 1);
  let farmer = new Resource("Farmer", "Generates 2 cakes/s", 100, 2);
  let cow = new Resource("Cow", "Generates 5 cakes/s", 500, 5);
  let chicken = new Resource("Chicken", "Generates 10 cakes/s", 1000, 10);
  let sugarMaster = new Resource("Sugar Master", "Generates 20 cakes/s", 3000, 20);
  let baker = new Resource("Baker", "Generates 50 cakes/s", 5000, 50);
  
  /*************************************************
   *  MULTI‐PURCHASE LOGIC
   *************************************************/
  function purchaseItem(item) {
    if (player.cakes >= item.currentCost) {
      player.cakes -= item.currentCost;
      item.increment(1);
      player.cakesPerSecond += item.cakesPerSecond;
      item.increaseCost();
      // update the on‐screen CPS display if you like
      document.getElementById("cps").innerHTML = `${player.cakesPerSecond} cakes per second`;
      updateStats();
    } else {
      alert(`You need ${item.currentCost} cakes to purchase a ${item.name}.`);
    }
  }
  
  // Functions to tie each store button to the correct resource:
  function clickCursor() {
    purchaseItem(cursor);
    document.getElementById("cursor").innerHTML = `${cursor.earned} Cursors`;
  }
  function clickFarmer() {
    purchaseItem(farmer);
    document.getElementById("farmer").innerHTML = `${farmer.earned} Farmers`;
  }
  function clickCow() {
    purchaseItem(cow);
    document.getElementById("cow").innerHTML = `${cow.earned} Cows`;
  }
  function clickChicken() {
    purchaseItem(chicken);
    document.getElementById("chicken").innerHTML = `${chicken.earned} Chickens`;
  }
  function clickMaster() {
    purchaseItem(sugarMaster);
    document.getElementById("sugar").innerHTML = `${sugarMaster.earned} Sugar Masters`;
  }
  function clickBaker() {
    purchaseItem(baker);
    document.getElementById("baker").innerHTML = `${baker.earned} Bakers`;
  }
  
  /*************************************************
   *  ONE‐TIME TIERED UPGRADE LOGIC
   *************************************************/
  // This function actually applies the cost & multiplier
  function applyTieredUpgrade(name, baseCost, cpsIncreasePercent, tierMultiplier) {
    if (player.upgradesList.includes(name)) {
      alert(`${name} is already purchased.`);
      return;
    }
    if (player.cakes < baseCost) {
      alert(`You need ${baseCost} cakes to purchase ${name}.`);
      return;
    }
    // Pay the cost
    player.cakes -= baseCost;
    // Multiply existing CPS by e.g. +7% * tierMultiplier
    player.cakesPerSecond *= (1 + (cpsIncreasePercent * tierMultiplier) / 100);
    // Mark as purchased
    player.upgradesList.push(name);
  
    alert(`${name} applied! Your CPS is now ${player.cakesPerSecond.toFixed(1)}`);
    updateStats();
  }
  
  // A helper function to create an upgrade “handler”
  function createTieredUpgrade(name, baseCost, cpsIncreasePercent, tierMultiplier) {
    return function () {
      applyTieredUpgrade(name, baseCost, cpsIncreasePercent, tierMultiplier);
    };
  }
  
    /*************************************************
    *  DEFINE ALL YOUR TIERED UPGRADES
    *************************************************/
    // Furnaces
     const upgradeFurnaceStandard = createTieredUpgrade("Furnace (Standard)", 250, 7, 1);
     const upgradeFurnaceStone    = createTieredUpgrade("Furnace (Stone)", 800, 7, 2);
    const upgradeFurnaceIron     = createTieredUpgrade("Furnace (Iron)", 3500, 7, 3);
    const upgradeFurnaceGold     = createTieredUpgrade("Furnace (Gold)", 8500, 7, 4);
    const upgradeFurnaceDiamond  = createTieredUpgrade("Furnace (Diamond)", 17000, 7, 5);
  
    // Milk Bottles
     const upgradeMilkStandard = createTieredUpgrade("Milk Bottle (Standard)", 200, 6, 1);
     const upgradeMilkStone    = createTieredUpgrade("Milk Bottle (Stone)", 700, 6, 2);
    const upgradeMilkIron     = createTieredUpgrade("Milk Bottle (Iron)", 3000, 6, 3);
    const upgradeMilkGold     = createTieredUpgrade("Milk Bottle (Gold)", 7500, 6, 4);
    const upgradeMilkDiamond  = createTieredUpgrade("Milk Bottle (Diamond)", 15000, 6, 5);

    // Flowers as tiered upgrades
    const upgradeBlueOrchid = createTieredUpgrade("Blue Orchid", 150, 4, 1);
    const upgradeOxeyeDaisy = createTieredUpgrade("Oxeye Daisy", 600, 4, 2);
    const upgradeRose       = createTieredUpgrade("Rose", 2500, 4, 3);
    const upgradePurpleFlower = createTieredUpgrade("Purple Flower", 6000, 4, 4);
    const upgradeGoldenFlower  = createTieredUpgrade("Golden Flower", 12000, 4, 5);

  
    // Books replace the old “Hoes”
    const upgradeBlueBook   = createTieredUpgrade("Blue Book",   100,   5, 1);
    const upgradeGreenBook  = createTieredUpgrade("Green Book",  500,   5, 2);
    const upgradePurpleBook = createTieredUpgrade("Purple Book", 2000,  5, 3);
    const upgradeRedBook    = createTieredUpgrade("Red Book",    5000,  5, 4);
    const upgradeGoldBook   = createTieredUpgrade("Gold Book",   10000, 5, 5);

  
  /*************************************************
   *  ATTACH BUTTONS TO UPGRADE FUNCTIONS
   *************************************************/
  document.addEventListener("DOMContentLoaded", () => {
    const attachListener = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn);
      else console.warn(`No element with id="${id}" found.`);
    };
  
    // Furnace Buttons
    attachListener("furnaceStandard", upgradeFurnaceStandard);
    attachListener("furnaceStone",    upgradeFurnaceStone);
    attachListener("furnaceIron",     upgradeFurnaceIron);
    attachListener("furnaceGold",     upgradeFurnaceGold);
    attachListener("furnaceDiamond",  upgradeFurnaceDiamond);
  
    // Milk Bottle Buttons
    attachListener("milkStandard", upgradeMilkStandard);
    attachListener("milkStone",    upgradeMilkStone);
    attachListener("milkIron",     upgradeMilkIron);
    attachListener("milkGold",     upgradeMilkGold);
    attachListener("milkDiamond",  upgradeMilkDiamond);
  
    // Flower Buttons 
    attachListener("blueOrchid", upgradeBlueOrchid);
    attachListener("oxeyeDaisy", upgradeOxeyeDaisy);
    attachListener("rose", upgradeRose);
    attachListener("purpleFlower", upgradePurpleFlower);
    attachListener("goldenFlower", upgradeGoldenFlower);

  
    // Books
    attachListener("blueBook",   upgradeBlueBook);
    attachListener("greenBook",  upgradeGreenBook);
    attachListener("purpleBook", upgradePurpleBook);
    attachListener("redBook",    upgradeRedBook);
    attachListener("goldBook",   upgradeGoldBook);
  });
  
  /*************************************************
   *  BASIC CAKE CLICK & DISPLAY
   *************************************************/
  // The main “click the cake” function
  function clickCake() {
    player.cakes += player.cakesPerClick;
    updateStats();
    updateCakeCount();
  }
  
  function updateCakeCount() {
    document.getElementById("cake").textContent = `${player.cakes} cakes`;
  }
  
  // Show game info in console for debugging
  function displayStats() {
    console.log(`Cakes: ${player.cakes}`);
    console.log(`Total CPS: ${player.cakesPerSecond}`);
    console.log(`Cursors: ${cursor.earned} (cost: ${cursor.currentCost})`);
    console.log(`Farmers: ${farmer.earned} (cost: ${farmer.currentCost})`);
    console.log(`Cows: ${cow.earned} (cost: ${cow.currentCost})`);
    console.log(`Chickens: ${chicken.earned} (cost: ${chicken.currentCost})`);
    console.log(`SugarMasters: ${sugarMaster.earned} (cost: ${sugarMaster.currentCost})`);
    console.log(`Bakers: ${baker.earned} (cost: ${baker.currentCost})`);
    console.log(`Upgrades purchased: ${player.upgradesList.join(", ")}`);
  }
  
  function updateStats() {
    // For on‐screen
    document.getElementById("cake").innerText = `${player.cakes.toFixed(2)} cakes`;
    // If you have an element for CPS:
    const cpsEl = document.getElementById("cps");
    if (cpsEl) {
      cpsEl.innerText = `${player.cakesPerSecond.toFixed(2)} cakes per second`;
    }
  
    displayStats(); // logs to console
  }
  
  function refreshStoreUI() {
    document.getElementById("cursor").innerHTML = `${cursor.earned} Cursors`;
    document.getElementById("farmer").innerHTML = `${farmer.earned} Farmers`;
    document.getElementById("cow").innerHTML = `${cow.earned} Cows`;
    document.getElementById("chicken").innerHTML = `${chicken.earned} Chickens`;
    document.getElementById("sugar").innerHTML = `${sugarMaster.earned} Sugar Masters`;
    document.getElementById("baker").innerHTML = `${baker.earned} Bakers`;
  }
  
  // Initialize once
  updateStats();
  