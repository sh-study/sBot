const Builder = require("@discordjs/builders");

module.exports = {
    data:
        new Builder.SlashCommandBuilder()
            .setName("secret")
            .setDescription("You can receive secret message."),
    async execute(interaction) {
        const random = [
            "사랑하는",
            "좋아하는",
            "내 유일한 사랑",
            "정말 많이 사랑하는",
            "재능도 엄청 많고 정말 이쁘고 사랑스러운"
        ];
        await interaction.reply({content: random[Math.floor(Math.random() * random.length)] + " 당신을 위한 시크릿 메시지예요!", ephemeral: true});
    }
};