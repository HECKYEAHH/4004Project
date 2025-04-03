// Resource object constructor
function Resource(name, description) {
    this.name = name;
    this.description = description;
    this.earned = 0;
    this.increment = function (amount) {
        this.earned += amount;
    };
}

// Button object constructor
function Button(name, description, onClickFunction) {
    this.name = name;
    this.description = description;
    this.onClick = onClickFunction;
}

// Global resources
let cake = new Resource("Cake", "These are the cakes you clicked!");
let farmer = new Resource("Farmer", "These are the farmers hired to grow more crops.");
let chicken = new Resource("Chicken", "These are the chickens that create eggs for your cake.");
let cow = new Resource("Cow", "These are the cows that produce the milk for your cake.");
let baker = new Resource("Baker", "These are the bakers who prepare your cake.");
let sugarMaster = new Resource("Sugar Master", "These are the sugar experts who will elevate your cake.");
let hoe = new Resource("Hoe", "These are the tools to tend to your soil more effectively.");
let furnace = new Resource("Furnace", "These are the ovens you bake your cake in.");
let water = new Resource("Water", "This is the quality of water used in cake preparation.");
let seed = new Resource("Seed", "This is the quality of seed used to grow ingredients for your cake.");

// Cake per click and player's cake count
let player = {
    cakesPerClick: 1, // Starts at 1 cake per click
    cakes: 0
};

// Cake Clicker button
let cakeClicker = new Button(
    "Cake Clicker",
    "Click this to claim your cake. Grants cakes per click.",
    function () {
        player.cakes += player.cakesPerClick; // Add cakes per click to the total cakes
        cake.increment(player.cakesPerClick); // Increment the cake resource
        updateStats();
    }
);

// Upgrade buttons with functionality (connected to Resource object system)
let farmersButton = new Button("Farmers", "Click this to promote a new farmer.", function () {
    farmer.increment(1);
    updateStats();
});

let chickensButton = new Button("Chicken", "Click this to birth a new chicken.", function () {
    chicken.increment(1);
    updateStats();
});

let cowsButton = new Button("Cow", "Click this to create a new cow.", function () {
    cow.increment(1);
    updateStats();
});

let bakersButton = new Button("Baker", "Click this to promote a new baker.", function () {
    baker.increment(1);
    updateStats();
});

let sugarMastersButton = new Button("Sugar Master", "Click this to promote a new sugar master.", function () {
    sugarMaster.increment(1);
    updateStats();
});

let hoeButton = new Button("Hoe", "Click this to purchase an additional hoe.", function () {
    hoe.increment(1);
    updateStats();
});

let furnaceButton = new Button("Furnace", "Click this to purchase an additional furnace.", function () {
    furnace.increment(1);
    updateStats();
});

let waterButton = new Button("Water", "Click this to improve water quality.", function () {
    water.increment(1);
    updateStats();
});

let seedButton = new Button("Seed", "Click this to improve seed quality.", function () {
    seed.increment(1);
    updateStats();
});

// Upgrade logic for tools (Hoe, Furnace, Water, Seeds)
function upgradeResource(resource, cakesCost, cakesPerClickIncrease) {
    if (player.cakes >= cakesCost) {
        player.cakes -= cakesCost;
        player.cakesPerClick += cakesPerClickIncrease; // Increase cakes per click based on the upgrade
        resource.increment(1); // Increase resource
        alert(`${resource.name} upgraded! Cakes per click increased by ${cakesPerClickIncrease}. Total cakes per click: ${player.cakesPerClick}`);
        updateStats();
    } else {
        alert(`You need ${cakesCost} cakes to upgrade ${resource.name}.`);
    }
}

// Statistics Button
let statsButton = new Button("Statistics", "View CakeClicker stats", function () {
    console.log("Statistics button clicked");
    displayStats();
});

// Display the resources in the console (or update UI)
function displayStats() {
    console.log(`Cakes: ${cake.earned}`);
    console.log(`Farmers: ${farmer.earned}`);
    console.log(`Chickens: ${chicken.earned}`);
    console.log(`Cows: ${cow.earned}`);
    console.log(`Bakers: ${baker.earned}`);
    console.log(`Sugar Masters: ${sugarMaster.earned}`);
    console.log(`Hoes: ${hoe.earned}`);
    console.log(`Furnaces: ${furnace.earned}`);
    console.log(`Water: ${water.earned}`);
    console.log(`Seed: ${seed.earned}`);
    console.log(`Total cakes per click: ${player.cakesPerClick}`);
    console.log(`Total cakes: ${player.cakes}`);
}

// Function to update stats on the screen
function updateStats() {
    displayStats();
}

// Simulating some button clicks
/*
cakeClicker.onClick();
farmersButton.onClick();
chickensButton.onClick();
cowsButton.onClick();
bakersButton.onClick();
sugarMastersButton.onClick();
hoeButton.onClick();
furnaceButton.onClick();
waterButton.onClick();
seedButton.onClick();

// Show the updated stats
statsButton.onClick();

// Example usage of upgrade logic (e.g., upgrading the Hoe costs 10 cakes, increases cakes per click by 2)
upgradeResource(hoe, 10, 2);
upgradeResource(furnace, 50, 10);
upgradeResource(water, 20, 5);
upgradeResource(seed, 30, 4);
*/