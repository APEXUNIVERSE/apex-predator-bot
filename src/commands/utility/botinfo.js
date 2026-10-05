const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Display detailed statistics and status of the bot'),

    async execute(interaction) {
        const totalGuilds = interaction.client.guilds.cache.size;
        const totalUsers = interaction.client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
        const totalChannels = interaction.client.channels.cache.size;

        const uptimeSeconds = Math.floor(process.uptime());
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = uptimeSeconds % 60;
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const memoryUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMemoryMB = (os.totalmem() / 1024 / 1024).toFixed(0);

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🤖 Bot Status & Statistics: ${interaction.client.user.username}`)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                { name: '🌐 Servers', value: `${totalGuilds.toLocaleString()}`, inline: true },
                { name: '👥 Users Managed', value: `${totalUsers.toLocaleString()}`, inline: true },
                { name: '📁 Channels', value: `${totalChannels.toLocaleString()}`, inline: true },
                { name: '⚡ Bot Latency', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true },
                { name: '📡 API WebSocket', value: `${interaction.client.ws.ping}ms`, inline: true },
                { name: '⏱️ Uptime', value: uptimeStr, inline: true },
                { name: '💾 Memory Usage', value: `${memoryUsedMB} MB`, inline: true },
                { name: '⚙️ Node.js', value: process.version, inline: true },
                { name: '📦 Discord.js', value: `v${djsVersion}`, inline: true }
            )
            .setFooter({ text: 'Discord Server Management Bot' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
