const Voice = require("@discordjs/voice");
const Builder = require("@discordjs/builders");

module.exports = {
    data: 
        new Builder.SlashCommandBuilder()
            .setName("join")
            .setDescription("Make the bot join the voice channel!"),
    async execute(interaction) {
        if (interaction.member.voice.channel) {
            const connection = Voice.getVoiceConnection(interaction.guildId);
            if (connection) {
                if (connection.packets.state.channel_id == interaction.member.voice.channelId) {
                    await interaction.reply("I'm already in!");
                    return;
                } else connection.destroy();
            }
            await interaction.reply("I'm in!");
            const join = Voice.joinVoiceChannel({
                channelId: interaction.member.voice.channelId,
                guildId: interaction.guildId,
                selfDeaf: false,
                selfMute: false,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });
            join.on(Voice.VoiceConnectionStatus.Disconnected, async () => {
                join.destroy();
            });
        } else {
            await interaction.reply("Please join the guild voice channel first.")
        }
    }
};