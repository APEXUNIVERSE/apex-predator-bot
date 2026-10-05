const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { addWarning, getWarnings } = require('../../database/db');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Issue a formal warning to a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to warn')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');

        if (target.id === interaction.user.id) {
            return interaction.reply({ embeds: [embeds.error('Error', 'You cannot warn yourself.')], ephemeral: true });
        }

        if (target.bot) {
            return interaction.reply({ embeds: [embeds.error('Error', 'You cannot warn a bot.')], ephemeral: true });
        }

        addWarning(interaction.guild.id, target.id, interaction.user.id, reason);
        const allWarns = getWarnings(interaction.guild.id, target.id);

        await target.send({
            embeds: [embeds.warning(`Warning in ${interaction.guild.name}`, `You have received a warning.\n**Reason:** ${reason}\n**Total Warnings:** ${allWarns.length}`)]
        }).catch(() => null);

        const modEmbed = embeds.modAction({
            action: 'Warn',
            target,
            moderator: interaction.user,
            reason,
            extra: { 'Total Warnings': allWarns.length }
        });

        await interaction.reply({ 
            embeds: [embeds.success('Member Warned', `Successfully warned **${target.tag}**.\n**Reason:** ${reason}\n**Total Warnings:** ${allWarns.length}`)] 
        });
        await logModAction(interaction.guild, modEmbed);
    }
};
