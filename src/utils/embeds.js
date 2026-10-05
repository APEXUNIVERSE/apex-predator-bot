const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    success(title, description) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle(`${config.emojis.success} ${title}`)
            .setDescription(description || null)
            .setTimestamp();
    },

    error(title, description) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle(`${config.emojis.error} ${title}`)
            .setDescription(description || null)
            .setTimestamp();
    },

    warning(title, description) {
        return new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle(`${config.emojis.warning} ${title}`)
            .setDescription(description || null)
            .setTimestamp();
    },

    info(title, description) {
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`${config.emojis.info} ${title}`)
            .setDescription(description || null)
            .setTimestamp();
    },

    modAction({ action, target, moderator, reason, duration, extra }) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.mod)
            .setTitle(`${config.emojis.mod} Moderation Action: ${action}`)
            .addFields(
                { name: 'Target User', value: `${target.tag || target.user?.tag || target} (${target.id || target})`, inline: true },
                { name: 'Moderator', value: `${moderator.tag || moderator.user?.tag || moderator} (${moderator.id || moderator})`, inline: true },
                { name: 'Reason', value: reason || 'No reason provided', inline: false }
            )
            .setTimestamp();

        if (duration) {
            embed.addFields({ name: 'Duration', value: `${duration}`, inline: true });
        }

        if (extra) {
            for (const [key, value] of Object.entries(extra)) {
                embed.addFields({ name: key, value: String(value), inline: true });
            }
        }

        if (target.displayAvatarURL) {
            embed.setThumbnail(target.displayAvatarURL({ dynamic: true }));
        }

        return embed;
    }
};
