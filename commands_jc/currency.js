const Builder = require("@discordjs/builders");
const Discord = require("discord.js");
const dbObjects = require("../dbObjects.js");

module.exports = {
    data:
        new Builder.SlashCommandBuilder()
            .setName("currency")
            .setDescription("currency commands")
            .addSubcommand(subcommand => subcommand
                .setName("balance")
                .setDescription("Check your money!")
                .addUserOption(option => option
                    .setName("user")
                    .setDescription("Text the member who you want to input.")))
            .addSubcommand(subcommand => subcommand
                .setName("inventory")
                .setDescription("Check your inventory!")
                .addUserOption(option => option
                    .setName("user")
                    .setDescription("Text the member who you want to input.")))
            .addSubcommand(subcommand => subcommand
                .setName("transfer")
                .setDescription("Transfer currency to another member.")
                .addUserOption(option => option
                    .setName("user")
                    .setDescription("Text the member who you want to input.")
                    .setRequired(true))
                .addIntegerOption(option => option
                    .setName("amount")
                    .setDescription("How much do you want to transfer?")
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName("buy")
                .setDescription("Buy items!"))
            .addSubcommand(subcommand => subcommand
                .setName("sell")
                .setDescription("Sell items!"))
            .addSubcommand(subcommand => subcommand
                .setName("shop")
                .setDescription("Displays the shop."))
            .addSubcommand(subcommand => subcommand
                .setName("leaderboard")
                .setDescription("Displays the leaderboard.")),
    async execute(interaction, currency, client) {
        const itemOptions = [
            {
                label: "Tea",
                value: "1"
            }, {
                label: "Cookie",
                value: "2"
            }, {
                label: "Coffee",
                value: "3"
            }
        ];
        switch (interaction.options.getSubcommand()) {
            case "balance":
                const balanceTarget = interaction.options.getMember("user") ?? interaction.member;
                return interaction.reply(`${balanceTarget.displayName} has ${currency.getBalance(balanceTarget.id)}💰`);
            case "inventory":
                const inventoryTarget = interaction.options.getMember("user") ?? interaction.member;
                const user = await dbObjects.Users.findOne({where: {user_id: inventoryTarget.id}})
                const items = await user?.getItems();

                if (!items?.length) return interaction.reply(`${inventoryTarget.displayName} has nothing!`);
                
                return interaction.reply(`${inventoryTarget.displayName} has ${Discord.Formatters.codeBlock(items.map(i => `${i.name} ${i.amount}`).join('\n'))}`);
            case "transfer":
                const currentAmount = currency.getBalance(interaction.user.id);
                const transferAmount = interaction.options.getInteger("amount");
                const transferTarget = interaction.options.getMember("user");

                if (transferTarget.user.bot) return interaction.reply("You can't transfer your money to the bot.")

                if (transferAmount > currentAmount) return interaction.reply(`Sorry ${interaction.member.displayName}, you only have ${currentAmount}💰.`);
                if (transferAmount <= 0) return interaction.reply(`Please enter an amount greater than zero, ${interaction.member.displayName}.`);

                currency.add(interaction.user.id, -transferAmount);
                currency.add(transferTarget.id, transferAmount);

                return interaction.reply(`Successfully transferred ${transferAmount}💰 to ${transferTarget.displayName}. Your current balance is ${currency.getBalance(interaction.user.id)}💰`);
            case "buy":
                const buyRow = new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageSelectMenu()
                            .setCustomId("buyItem")
                            .setPlaceholder("Choose the item")
                            .addOptions(itemOptions)
                    );
                return await interaction.reply({content: "What item do you want to buy?", components: [buyRow]});
            case "sell":
                const sellRow = new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageSelectMenu()
                            .setCustomId("sellItem")
                            .setPlaceholder("Choose the item")
                            .addOptions(itemOptions)
                    );
                return await interaction.reply({content: "What item do you want to sell?", components: [sellRow]});
            case "shop":
                const itemsAll = await dbObjects.CurrencyShop.findAll();
                return interaction.reply(Discord.Formatters.codeBlock(itemsAll.map(i => `${i.name}: ${i.cost}💰`).join("\n")));
            case "leaderboard":
                let block = null;
                if (currency.size) {
                    block = Discord.Formatters.codeBlock(
                        currency.sort((a, b) => b.balance - a.balance)
                            .filter(user => interaction.guild.members.cache.has(user.user_id))
                            .first(10)
                            .map((user, position) => `(${position + 1}) ${interaction.guild.members.cache.get(user.user_id).displayName}: ${user.balance}💰`)
                            .join("\n")
                    )
                }
                return interaction.reply(block ?? "There's nothing to display on leaderboard.")
        }
        
    }
};