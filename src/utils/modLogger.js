const { getGuildSettings } = require('../database/db');
const logger = require('./logger');

module.exports = {
    async logModAction(guild, embed) {
        try {
            if (!guild) return;
            const settings = getGuildSettings(guild.id);
            if (!settings || !settings.mod_log_channel) return;

            const channel = await guild.channels.fetch(settings.mod_log_channel).catch(() => null);
            if (channel && channel.isTextBased()) {
                await channel.send({ embeds: [embed] }).catch(err => {
                    logger.error(`Failed to send log in channel ${channel.id}:`, err);
                });
            }
        } catch (err) {
            logger.error('Error executing logModAction:', err);
        }
    }
};
