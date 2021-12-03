const Discord = require("discord.js");
const fs = require("fs");
const dbObjects = require("./dbObjects.js");
require("dotenv").config();

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

const commandFileInit = path => {
    const commandFiles = fs.readdirSync(path).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(path + `/${file}`);
        client.commands.set(command.data.name, command);
    }
};

commandFileInit("./commands_jc");
commandFileInit("./commands_official");
commandFileInit("./commands_demo");

const currency = new Discord.Collection();

module.exports = currency;

Reflect.defineProperty(currency, "add", {
    value: async function add(id, amount) {
        const user = currency.get(id);

        if (user) {
            user.balance += Number(amount);
            return user.save();
        }

        const newUser = await dbObjects.Users.create({user_id: id, balance: amount});
        currency.set(id, newUser);

        return newUser;
    }
});

Reflect.defineProperty(currency, "getBalance", {
    value: function getBalance(id) {
        const user = currency.get(id);
        return user ? user.balance : 0;
    }
});

const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.on("messageCreate", async message => {
    if (message.author.bot) return;

    if (message.content == "__test") return currency.add(message.author.id, 30);
    currency.add(message.author.id, 1);
});

client.login(process.env.token);