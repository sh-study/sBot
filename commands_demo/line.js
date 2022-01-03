const Builder = require("@discordjs/builders");

module.exports = {
    data: 
        new Builder.SlashCommandBuilder()
            .setName("line")
            .setDescription("Bot will send a line."),
    async execute(interaction) {
        await interaction.reply("------------------------------------------------------------------------------------------------");
    }
};