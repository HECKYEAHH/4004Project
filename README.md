# MineClicker
 
# Make sure you have a minecraft username ready to go so we can use the API to load up your character name and profile

# https://cis4004app-6e9d945f299e.herokuapp.com/ USE THIS LINK TO ACCESS THE WEBSITE

# AI DOCUMENTATION

<!--> ChatGPT 4o and o1
AI Used: ChatGPT (Large Language Model by OpenAI, GPT-4)

Model/Version: GPT-4 (no local model used)

Prompts & Responses:

User Prompt (summary):

"How do I integrate Auth0 into my idle game?"

"How do I load a Minecraft username from PlayerDB and store it in Mongo?"

"How can I move images into /public/images and reference them?"

"How do I save/load the player’s clicker data to Mongo?"

"It’s not saving to Mongo—what am I missing?"

"I want a Save button in the Options menu. How do I call saveGameToServer() from there?"

"It’s still not saving. Do you think there’s a problem with how I’m calling saveGameToServer()?"

I want to make it so that there are images in the background of idle.html and minecraftsetup.html in which it rotates just like the minecraft title screen




ChatGPT (GPT-4) Responses (summary):

Provided step-by-step instructions to:

Set up routes in server.js for /api/saveGame and /api/loadGame.

Extend the Mongoose user schema with gameData fields.

Move localStorage logic to server-based saving.

Integrate PlayerDB lookups in minecraftSetup.html & related routes.

Clean up code by removing duplicates (e.g., profile.js if not in use).

Create an “Options” toggle that includes a clickable Save button to call saveGameToServer().

Check the browser dev tools & server logs to confirm routes are invoked.

Made a function to rotate through images for background

Help start set up of auth0 authentication

Help set up PlayerDB API when running into issues with setup

Helped set up mongo atlas database with heroku when we ran into issues

Helped set up heroku with github and Mongo atlas when we ran into issues


Affected Files & Functions:

idle.html

saveFile_deleteFile.js (renamed or extended to handle server saving)

Buttons_Resources.js (to add a “Save” button in OptionToggle)

server.js (new routes: POST /api/saveGame and GET /api/loadGame, plus user schema changes)

Upgrades_Buttons_Resources.js (removing auto-click lines that override loaded data)

fetchUsername.js

Mineclicker.css

Minecraft_setup.css

style_login.css

index.html

minecraft_setup.html