const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display detailed information and statistics about the server'),

    async execute(interaction) {
        const { guild } = interaction;
        await guild.members.fetch(); // Ensure full member cache for counts

        const totalMembers = guild.memberCount;
        const humans = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;

        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

        const rolesCount = guild.roles.cache.size - 1; // Exclude @everyone
        const emojisCount = guild.emojis.cache.size;

        const owner = await guild.fetchOwner();
        const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`📊 Server Information: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👑 Owner', value: `${owner.user.tag} (<@${owner.id}>)`, inline: true },
                { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
                { name: '📅 Created On', value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`, inline: false },
                { 
                    name: `👥 Members (${totalMembers})`, 
                    value: `• Humans: **${humans}**\n• Bots: **${bots}**`, 
                    inline: true 
                },
                { 
                    name: `📁 Channels (${guild.channels.cache.size})`, 
                    value: `• Text: **${textChannels}**\n• Voice: **${voiceChannels}**\n• Categories: **${categories}**`, 
                    inline: true 
                },
                { 
                    name: '✨ Boost Level', 
                    value: `• Tier: **${guild.premiumTier}**\n• Boosts: **${guild.premiumSubscriptionCount || 0}**`, 
                    inline: true 
                },
                { 
                    name: '🏷️ Roles & Emojis', 
                    value: `• Roles: **${rolesCount}**\n• Emojis: **${emojisCount}**`, 
                    inline: true 
                },
                {
                    name: '🔒 Verification Level',
                    value: `**${guild.verificationLevel}**`,
                    inline: true
                }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        await interaction.reply({ embeds: [embed] });
    }
};
