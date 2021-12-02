const Discord = require("discord.js");
const fs = require("fs");
const dbObjects = require("./dbObjects.js");
const Sequelize = require("sequelize");
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

const commandFileInit = path => {
    const commandFiles = fs.readdirSync(path).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(path + `/${file}`);
        client.commands.set(command.data.name, command);
    }
};

client.commands = new Discord.Collection();
commandFileInit("./commands_jc");
commandFileInit("./commands_official");
commandFileInit("./commands_demo");

const currency = new Discord.Collection();

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

client.once("ready", async () => {
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
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;

    if (message.content == "__test") return currency.add(message.author.id, 30);
    currency.add(message.author.id, 1);
});

client.on("interactionCreate", async interaction => {
    switch (true) {
        case interaction.isCommand():
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                if (command.data.name == "currency") {
                    return await command.execute(interaction, currency);
                }
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                return interaction.reply({content: "There was an error while executing this command!", ephemeral: true});
            }

            break;
        case interaction.isButton():
            switch (interaction.customId) {
                case "heart":
                    return interaction.reply("💖");
            }
            break;
        case interaction.isSelectMenu():
            const user = await dbObjects.Users.findOne({where: {user_id: interaction.user.id}});
            switch (interaction.customId) {
                case "buyItem":
                    const buyItem = await dbObjects.CurrencyShop.findOne({where: {id: {[Sequelize.Op.like]: interaction.values}}});

                    if (buyItem.cost > currency.getBalance(interaction.user.id)) {
                        return interaction.update({content: `You currently have ${currency.getBalance(interaction.user.id)}, but the ${buyItem.name} costs ${buyItem.cost}💰.`, components: []});
                    }

                    currency.add(interaction.user.id, -buyItem.cost);
                    await user?.addItem(buyItem);

                    return interaction.update({content: `You've bought: ${buyItem.name}.`, components: []});
                case "sellItem":
                    const sellItem = await dbObjects.UserItems.findOne({where: {user_id: interaction.user.id, item_id: {[Sequelize.Op.like]: interaction.values}}});
                    const shopItem = await dbObjects.CurrencyShop.findOne({where: {id: {[Sequelize.Op.like]: interaction.values}}});

                    if (!sellItem) return interaction.update({content: `You don't have ${shopItem.name}.`, components: []});

                    currency.add(interaction.user.id, shopItem.cost);
                    await user.deleteItem(sellItem);

                    return interaction.update({content: `You've sold: ${sellItem.name}.`, components: []});
            }
    }
});

client.login(process.env.token);