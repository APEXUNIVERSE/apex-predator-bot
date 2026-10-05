const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getInvites } = require('../../database/db');

const VERIFY_CHANNEL_ID = '1539942524578304052';
const GENERAL_INTEL_CHANNEL_ID = '1539942530752454686';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('myinvite')
        .setDescription('Generate your personal tracking invite link and check your rewards ladder progress'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const { guild, user, member, client } = interaction;

        try {
            const targetChannel = guild.channels.cache.get(VERIFY_CHANNEL_ID) || guild.channels.cache.find(c => c.isTextBased());

            const invite = await targetChannel.createInvite({
                maxAge: 0,
                maxUses: 0,
                unique: true,
                reason: `Personal Tracking Invite for ${user.tag}`
            });

            if (!client.invites) client.invites = new Map();
            const guildInvMap = client.invites.get(guild.id) || new Map();
            guildInvMap.set(invite.code, invite.uses);
            client.invites.set(guild.id, guildInvMap);

            const currentInvites = getInvites(guild.id, user.id);

            const inviteEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('🚀 Your Personal Tracking Invite Link')
                .setDescription(
                    `Hey **${member.displayName}**! Share your personal link to recruit friends and unlock prestige roles:\n\n` +
                    `🔗 **\`${invite.url}\`**\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `### 📊 Your Recruitment Stats:\n` +
                    `• 🎯 **Verified Recruits:** \`${currentInvites} Friends\`\n` +
                    `• 🎖️ **Next Role Target:** ${currentInvites < 1 ? '`1 Recruit` needed for **🔥 Daily Grinder**' : currentInvites < 5 ? `\`${5 - currentInvites}\` more needed for **💎 Community Elite**` : currentInvites < 10 ? `\`${10 - currentInvites}\` more needed for **⭐ Task Force Director & VIP**` : '**Maximum VIP Prestige Achieved! 🏆**'}\n\n` +
                    `### 🎁 Rewards Ladder:\n` +
                    `• **1 Friend Joined:** 🔥 \`Daily Grinder\` Role\n` +
                    `• **5 Friends Joined:** 💎 \`Community Elite\` Role\n` +
                    `• **10 Friends Joined:** ⭐ \`Task Force Director\` & VIP Champion Ranks!\n\n` +
                    `*Whenever a friend joins with your link, the server will celebrate you with an automatic shoutout in <#${GENERAL_INTEL_CHANNEL_ID}>!* 💣🎧`
                )
                .setFooter({ text: 'Apex Universe • Squad Growth Rewards' })
                .setTimestamp();

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('🌐 Official Website')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.apexuniverse.online/')
            );

            return interaction.editReply({ embeds: [inviteEmbed], components: [actionRow] });
        } catch (error) {
            return interaction.editReply({ content: '❌ Failed to generate personal invite link.' });
        }
    }
};
