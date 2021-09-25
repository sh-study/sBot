const Discord = require("discord.js");
const Voice = require("@discordjs/voice");
const fs = require("fs");
const config = require("./config.json");

const flags = Discord.Intents.FLAGS;
const intents = [
    flags.GUILDS, 
    flags.GUILD_MEMBERS, 
    flags.GUILD_BANS, 
    flags.GUILD_EMOJIS_AND_STICKERS, 
    flags.GUILD_INTEGRATIONS, 
    flags.GUILD_WEBHOOKS, 
    flags.GUILD_INVITES,
    flags.GUILD_VOICE_STATES,
    flags.GUILD_PRESENCES,
    flags.GUILD_MESSAGES,
    flags.GUILD_MESSAGE_REACTIONS,
    flags.GUILD_MESSAGE_TYPING,
    flags.DIRECT_MESSAGES,
    flags.DIRECT_MESSAGE_REACTIONS,
    flags.DIRECT_MESSAGE_TYPING
];
const client = new Discord.Client({intents: intents});

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands_jc").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands_jc/${file}`);
    client.commands.set(command.data.name, command);
}

client.once("ready", () => {
    client.user.setPresence({
        activities: [{
            name: "Spotify",
            type: "LISTENING"
        }],
        status: "online"
    });
    console.log("Ready!");
});

client.on("interactionCreate", async interaction => {
    switch (true) {
        case interaction.isCommand():
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
        
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                return interaction.reply({content: "There was an error while executing this command!", ephemeral: true});
            }

            break;
        case interaction.isButton():
            switch (interaction.customId) {
                case "heart":
                    interaction.reply("💖");
            }
            break;
    }
});

client.login(config.token);