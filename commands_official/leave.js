const Builder = require("@discordjs/builders");
const Voice = require("@discordjs/voice");

module.exports = {
    data:
        new Builder.SlashCommandBuilder()
            .setName("leave")
            .setDescription("Make the bot leave the voice channel!"),
    async execute(interaction) {
        const connection = Voice.getVoiceConnection(interaction.guildId);
        if (connection) {
            await interaction.reply("I'm out!");
            connection.destroy();
        } else await interaction.reply("I don't have any voice connection.");
    }
};