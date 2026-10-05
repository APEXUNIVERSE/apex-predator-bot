const { EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('../database/db');
const logger = require('../utils/logger');
const embeds = require('../utils/embeds');
const { logModAction } = require('../utils/modLogger');
const config = require('../config');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const { guild } = member;
        const settings = getGuildSettings(guild.id);
        if (!settings) return;

        // 1. Send Leave / Farewell Message
        if (settings.leave_enabled && settings.leave_channel) {
            const channel = await guild.channels.fetch(settings.leave_channel).catch(() => null);
            if (channel && channel.isTextBased()) {
                const rawTemplate = settings.leave_message || '{user} has left the server.';
                const formattedMsg = rawTemplate
                    .replace(/\{user\}/g, `**${member.user.tag}**`)
                    .replace(/\{username\}/g, member.user.username)
                    .replace(/\{server\}/g, guild.name)
                    .replace(/\{memberCount\}/g, guild.memberCount.toString());

                const leaveEmbed = new EmbedBuilder()
                    .setColor(config.colors.warning)
                    .setTitle('👋 Goodbye!')
                    .setDescription(formattedMsg)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({ text: `Remaining Members: ${guild.memberCount}` })
                    .setTimestamp();

                await channel.send({ embeds: [leaveEmbed] }).catch(err => {
                    logger.error('Failed to send leave message:', err);
                });
            }
        }

        // 2. Log to Mod Channel
        const modEmbed = embeds.modAction({
            action: 'Member Left',
            target: member.user,
            moderator: 'Gateway Event',
            reason: 'User left or was removed from the server',
            extra: {
                'Remaining Members': guild.memberCount
            }
        });

        await logModAction(guild, modEmbed);
    }
};
