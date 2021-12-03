const dbObjects = require("../dbObjects.js");

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
        storedBalances.forEach(b => client.currency.set(b.user_id, b));
    
        console.log("Ready!");
    }
};