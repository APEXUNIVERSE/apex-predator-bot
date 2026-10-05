const embeds = require('../utils/embeds');
const { logModAction } = require('../utils/modLogger');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        const { guild } = newMember;

        // 1. Nickname Change
        if (oldMember.nickname !== newMember.nickname) {
            const modEmbed = embeds.modAction({
                action: 'Member Nickname Updated',
                target: newMember.user,
                moderator: 'User / Mod Action',
                reason: 'Nickname changed',
                extra: {
                    'Old Nickname': oldMember.nickname || oldMember.user.username,
                    'New Nickname': newMember.nickname || newMember.user.username
                }
            });
            await logModAction(guild, modEmbed);
        }

        // 2. Timeout Change
        if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
            if (newMember.isCommunicationDisabled()) {
                const timeoutExpiry = Math.floor(newMember.communicationDisabledUntilTimestamp / 1000);
                const modEmbed = embeds.modAction({
                    action: 'Member Timed Out',
                    target: newMember.user,
                    moderator: 'Audit Event',
                    reason: 'Communication disabled',
                    extra: {
                        'Expires': `<t:${timeoutExpiry}:R>`
                    }
                });
                await logModAction(guild, modEmbed);
            }
        }
    }
};
