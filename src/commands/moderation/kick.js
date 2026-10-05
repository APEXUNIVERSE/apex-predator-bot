const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for kicking')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (target.id === interaction.user.id) {
            return interaction.reply({ embeds: [embeds.error('Error', 'You cannot kick yourself.')], ephemeral: true });
        }

        if (target.id === interaction.client.user.id) {
            return interaction.reply({ embeds: [embeds.error('Error', 'You cannot kick the bot.')], ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [embeds.error('Error', 'This user is not in the server.')], ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ embeds: [embeds.error('Error', 'I cannot kick this member. Their role may be higher than mine.')], ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({ embeds: [embeds.error('Error', 'You cannot kick a member with a role equal to or higher than yours.')], ephemeral: true });
        }

        // Try to DM the member
        await target.send({
            embeds: [embeds.warning(`Kicked from ${interaction.guild.name}`, `**Reason:** ${reason}`)]
        }).catch(() => null);

        await member.kick(`${reason} (Kicked by ${interaction.user.tag})`);

        const modEmbed = embeds.modAction({
            action: 'Kick',
            target,
            moderator: interaction.user,
            reason
        });

        await interaction.reply({ embeds: [embeds.success('Member Kicked', `Successfully kicked **${target.tag}**.\n**Reason:** ${reason}`)] });
        await logModAction(interaction.guild, modEmbed);
    }
};
