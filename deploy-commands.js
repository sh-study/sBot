const fs = require("fs");
const Rest = require("@discordjs/rest");
const Api = require("discord-api-types/v9");
const config = require("./config.json");

const cmd_jc = [];
const commandFiles = fs.readdirSync("./commands_jc").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands_jc/${file}`);
    cmd_jc.push(command.data.toJSON());
}

const rest = new Rest.REST({version: '9'}).setToken(config.token);

(async () => {
    try {
        console.log("Started refreshing application commands for jangchoongz server.");

        const jc_guilds = [config.guild_id_jc, config.guild_id_ds];
        for (const guild of jc_guilds) {
            await rest.put(
                Api.Routes.applicationGuildCommands(config.client_id, guild),
                {body: cmd_jc}
            );
        }

        console.log("Successfully registered application commands for jangchoongz server.");
    } catch (error) {
        console.error(error);
    }
})();