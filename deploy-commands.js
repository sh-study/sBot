const fs = require("fs");
const Rest = require("@discordjs/rest");
const Api = require("discord-api-types/v9");
const config = require("./config.json");

const commandFileInit = (path, cmd) => {
    const commandFiles = fs.readdirSync(path).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(path + `/${file}`);
        cmd.push(command.data.toJSON());
    }
};

const cmd_jc = [];
commandFileInit("./commands_jc", cmd_jc);

const cmd_ofl = [];
commandFileInit("./commands_official", cmd_ofl);

const cmd_demo = [];
commandFileInit("./commands_demo", cmd_demo);

const rest = new Rest.REST({version: '9'}).setToken(config.token);

(async () => {
    try {
        const ofl_guilds = [config.guild_id_official];
        const jc_guilds = [config.guild_id_jc, config.guild_id_mannam];
        const demo_guilds = [config.guild_id_ds];

        const parts = [ofl_guilds, jc_guilds, demo_guilds];
        let cmd = [];
        console.log(`Started refreshing application commands.`);
        for (const part of parts) {
            if (part == ofl_guilds) cmd = cmd_ofl;
            if (part == jc_guilds) cmd = cmd_jc.concat(cmd_ofl);
            if (part == demo_guilds) cmd = cmd_demo;
            for (const guild of part) {
                await rest.put(
                    Api.Routes.applicationGuildCommands(config.client_id, guild),
                    {body: cmd}
                );
            }
        }
        console.log(`Successfully registered application commands.`);

    } catch (error) {
        console.error(error);
    }
})();