const { PermissionFlagsBits } = require('discord.js');
const { getGuildSettings } = require('../database/db');
const embeds = require('../utils/embeds');
const { logModAction } = require('../utils/modLogger');

// In-memory cache for anti-spam detection
const userMessageTimestamps = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        // Skip moderation checks for Server Administrators
        if (message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
            return;
        }

        const settings = getGuildSettings(message.guild.id);
        if (!settings) return;

        const content = message.content.toLowerCase();
        let violated = false;
        let violationReason = '';

        // 1. Anti-Invite Detection
        if (settings.automod_anti_invites) {
            const inviteRegex = /(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+|discord\.com\/invite\/.+)/i;
            if (inviteRegex.test(message.content)) {
                violated = true;
                violationReason = 'Unauthorized Discord Invite Link';
            }
        }

        // 2. Anti-Link Detection
        if (!violated && settings.automod_anti_links) {
            const linkRegex = /(https?:\/\/[^\s]+)/gi;
            if (linkRegex.test(message.content)) {
                violated = true;
                violationReason = 'Unauthorized External Link';
            }
        }

        // 3. Anti-Mass Mention Detection (> 5 user/role mentions)
        if (!violated && settings.automod_anti_mass_mention) {
            const mentionCount = (message.mentions.users.size + message.mentions.roles.size);
            if (mentionCount > 5) {
                violated = true;
                violationReason = `Mass Mention Spam (${mentionCount} mentions)`;
            }
        }

        // 4. Bad Words / Profanity Blacklist
        if (!violated && settings.automod_bad_words) {
            try {
                const badWords = JSON.parse(settings.automod_bad_words || '[]');
                for (const word of badWords) {
                    if (word && content.includes(word.toLowerCase())) {
                        violated = true;
                        violationReason = `Prohibited Word Detected (\`${word}\`)`;
                        break;
                    }
                }
            } catch (e) {
                // ignore parsing error
            }
        }

        // 5. Anti-Spam (Rate Limit & Flood Detection)
        if (!violated && settings.automod_anti_spam) {
            const now = Date.now();
            const userId = message.author.id;
            const timestamps = userMessageTimestamps.get(userId) || [];

            // Keep only timestamps within the last 5 seconds
            const recent = timestamps.filter(t => now - t < 5000);
            recent.push(now);
            userMessageTimestamps.set(userId, recent);

            if (recent.length >= 5) {
                violated = true;
                violationReason = 'Message Flood / Rapid Spam';
            }
        }

        // Execute AutoMod Penalty
        if (violated) {
            try {
                await message.delete();
            } catch (e) {
                // message might already be deleted
            }

            const warnMsg = await message.channel.send({
                content: `<@${message.author.id}>`,
                embeds: [embeds.error('AutoMod Alert', `Your message was removed by AutoMod.\n**Reason:** ${violationReason}`)]
            }).catch(() => null);

            if (warnMsg) {
                setTimeout(() => warnMsg.delete().catch(() => null), 6000);
            }

            const modEmbed = embeds.modAction({
                action: 'AutoMod Flag',
                target: message.author,
                moderator: '🤖 AutoMod System',
                reason: violationReason,
                extra: {
                    'Channel': `<#${message.channel.id}>`,
                    'Message Snippet': message.content ? `\`${message.content.slice(0, 200)}\`` : '*None*'
                }
            });

            await logModAction(message.guild, modEmbed);
        }
    }
};
