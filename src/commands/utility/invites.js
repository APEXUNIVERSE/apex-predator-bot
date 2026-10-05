const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getInvites, getTopInviters } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Check your or another operator\'s total verified recruits')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to check invites for (defaults to yourself)')
                .setRequired(false)
        ),
    async execute(interaction) {
        const { guild, user } = interaction;
        const targetUser = interaction.options.getUser('target') || user;
        const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);

        const inviteCount = getInvites(guild.id, targetUser.id);

        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle(`🎯 Recruitment Stats: ${targetMember ? targetMember.displayName : targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Operator', value: `<@${targetUser.id}>`, inline: true },
                { name: '📈 Total Recruits', value: `\`${inviteCount} Members\``, inline: true },
                { 
                    name: '🎖️ Rank Status', 
                    value: inviteCount >= 10 ? '👑 **VIP Champion / Task Force Director**' :
                           inviteCount >= 5 ? '💎 **Community Elite**' :
                           inviteCount >= 1 ? '🔥 **Daily Grinder**' :
                           '🎯 **Rookie Recruiter** (0 Invites)',
                    inline: false 
                },
                {
                    name: '🎁 Next Milestone Target',
                    value: inviteCount < 1 ? '`1 Invite` needed for **🔥 Daily Grinder**' :
                           inviteCount < 5 ? `\`${5 - inviteCount}\` more needed for **💎 Community Elite**` :
                           inviteCount < 10 ? `\`${10 - inviteCount}\` more needed for **⭐ Task Force Director & VIP**` :
                           '🏆 **Max Tier Unlocked!**',
                    inline: false
                }
            )
            .setFooter({ text: 'Use /myinvite to generate your link and climb the leaderboard!' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
