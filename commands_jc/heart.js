const Builder = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data:
        new Builder.SlashCommandBuilder()
            .setName("heart")
            .setDescription("Press the button if you want my heart!"),
    async execute(interaction) {
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setLabel("Want some hearts?")
                    .setCustomId("heart")
                    .setEmoji("💖")
                    .setStyle("PRIMARY")
            )

            await interaction.reply({content: "Press the button!", components: [row]});
    }
};