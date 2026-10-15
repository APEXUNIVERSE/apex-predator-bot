const logger = require('../utils/logger');
const { COMBAT_ROLE_IDS, CHANNELS } = require('../utils/constants');
const { getUserCombatRole, setUserCombatRole } = require('../database/db');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        try {
            const member = newState.member || oldState.member;
            if (!member || member.user.bot) return;

            const oldChannelId = oldState.channelId;
            const newChannelId = newState.channelId;

            // No voice channel change occurred (e.g. mute/deafen/screenshare)
            if (oldChannelId === newChannelId) return;

            const guild = newState.guild || oldState.guild;
            if (!guild) return;

            const isInActiveVC = Boolean(newChannelId && newChannelId !== CHANNELS.AFK_VOICE);

            if (isInActiveVC) {
                // Member entered an active voice channel or switched channels
                let targetRoleId = getUserCombatRole(guild.id, member.id);

                // If no record exists yet, check if member currently holds a combat role
                if (!targetRoleId) {
                    const existingRole = COMBAT_ROLE_IDS.find(id => member.roles.cache.has(id));
                    if (existingRole) {
                        targetRoleId = existingRole;
                        setUserCombatRole(guild.id, member.id, existingRole);
                    }
                }

                if (targetRoleId && COMBAT_ROLE_IDS.includes(targetRoleId)) {
                    // Assign the saved combat role if not already assigned
                    if (!member.roles.cache.has(targetRoleId)) {
                        await member.roles.add(targetRoleId).catch(err => {
                            logger.error(`Failed to add combat role ${targetRoleId} to ${member.user.tag}:`, err);
                        });
                    }

                    // Strip any other combat roles to ensure strictly one combat specialization
                    const otherCombatRoles = COMBAT_ROLE_IDS.filter(id => id !== targetRoleId && member.roles.cache.has(id));
                    if (otherCombatRoles.length > 0) {
                        await member.roles.remove(otherCombatRoles).catch(err => {
                            logger.error(`Failed to remove other combat roles from ${member.user.tag}:`, err);
                        });
                    }
                }
            } else {
                // Member disconnected from voice or moved to AFK channel
                const rolesToRemove = COMBAT_ROLE_IDS.filter(id => member.roles.cache.has(id));
                if (rolesToRemove.length > 0) {
                    await member.roles.remove(rolesToRemove).catch(err => {
                        logger.error(`Failed to remove combat roles from ${member.user.tag} on VC exit:`, err);
                    });
                }
            }
        } catch (error) {
            logger.error('Error in voiceStateUpdate event handler:', error);
        }
    }
};
