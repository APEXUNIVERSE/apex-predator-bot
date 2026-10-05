const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot latency and Discord API responsiveness'),

    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const roundTrip = sent.createdTimestamp - interaction.createdTimestamp;
        const wsPing = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '⚡ Roundtrip Latency', value: `\`${roundTrip}ms\``, inline: true },
                { name: '📡 WebSocket Heartbeat', value: `\`${wsPing}ms\``, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    }
};
