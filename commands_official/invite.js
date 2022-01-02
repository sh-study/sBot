const Builder = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data:
        new Builder.SlashCommandBuilder()
            .setName("invite")
            .setDescription("Invite me to other servers!"),
    async execute(interaction) {
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setLabel("Invite Link")
                    .setStyle("LINK")
                    .setURL("https://discord.com/oauth2/authorize?client_id=889021675969073202&permissions=536870911999&scope=bot%20applications.commands")
            )

        await interaction.reply({content: "Click the button to invite me!", components: [row]});
    }
};