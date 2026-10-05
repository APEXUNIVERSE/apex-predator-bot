const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for banning')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('delete_messages_days')
                .setDescription('Number of days of message history to delete (0 to 7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete_messages_days') || 0;

        if (target.id === interaction.user.id) {
            return interaction.reply({ embeds: [embeds.error('Error', 'You cannot ban yourself.')], ephemeral: true });
        }

        if (target.id === interaction.client.user.id) {
            return interaction.reply({ embeds: [embeds.error('Error', 'You cannot ban the bot.')], ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (member) {
            if (!member.bannable) {
                return interaction.reply({ embeds: [embeds.error('Error', 'I cannot ban this member. Their role may be higher than mine.')], ephemeral: true });
            }

            if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
                return interaction.reply({ embeds: [embeds.error('Error', 'You cannot ban a member with a role equal to or higher than yours.')], ephemeral: true });
            }

            // Try to DM the member before banning
            await target.send({
                embeds: [embeds.warning(`Banned from ${interaction.guild.name}`, `**Reason:** ${reason}`)]
            }).catch(() => null);
        }

        await interaction.guild.members.ban(target.id, {
            deleteMessageSeconds: deleteDays * 86400,
            reason: `${reason} (Banned by ${interaction.user.tag})`
        });

        const modEmbed = embeds.modAction({
            action: 'Ban',
            target,
            moderator: interaction.user,
            reason,
            extra: { 'Message History Deleted': `${deleteDays} days` }
        });

        await interaction.reply({ embeds: [embeds.success('Member Banned', `Successfully banned **${target.tag}**.\n**Reason:** ${reason}`)] });
        await logModAction(interaction.guild, modEmbed);
    }
};
