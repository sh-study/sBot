const dbObjects = require("../dbObjects.js");
const currency = require("../index.js");

module.exports = {
    name: "ready",
    once: "true",
    async execute(client) {
        client.user.setPresence({
            activities: [{
                name: "Spotify",
                type: "LISTENING"
            }],
            status: "online"
        });
    
        const storedBalances = await dbObjects.Users.findAll();
        storedBalances.forEach(b => currency.set(b.user_id, b));
    
        console.log("Ready!");
    }
};