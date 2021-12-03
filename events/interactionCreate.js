const currency = require("../index.js");
const dbObjects = require("../dbObjects.js");
const Sequelize = require("sequelize");

module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(interaction) {
        console.log(interaction);
        switch (true) {
            case interaction.isCommand():
                const command = interaction.client.commands.get(interaction.commandName);
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
    }
};