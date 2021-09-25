const Builder = require("@discordjs/builders");

module.exports = {
    data: 
        new Builder.SlashCommandBuilder()
            .setName("jangchoongz")
            .setDescription("I love Jangchoongz!")
            .addUserOption(option => option
                .setName("user")
                .setDescription("Text the member who you want to input.")),
    async execute(interaction) {
        const member = interaction.options.getMember("user");
        if (member) {
            await interaction.reply(Builder.userMention(member.user.id) + " is my love. 💖");
        } else {
            await interaction.reply("My love. 💖");
        }
    }
};