const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to remove timeout from')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for removing timeout')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [embeds.error('Error', 'This user is not in the server.')], ephemeral: true });
        }

        if (!member.isCommunicationDisabled()) {
            return interaction.reply({ embeds: [embeds.error('Error', 'This member is not currently timed out.')], ephemeral: true });
        }

        if (!member.moderatable) {
            return interaction.reply({ embeds: [embeds.error('Error', 'I cannot modify this member.')], ephemeral: true });
        }

        await member.timeout(null, `${reason} (Timeout removed by ${interaction.user.tag})`);

        const modEmbed = embeds.modAction({
            action: 'Untimeout',
            target,
            moderator: interaction.user,
            reason
        });

        await interaction.reply({ embeds: [embeds.success('Timeout Removed', `Successfully removed timeout from **${target.tag}**.\n**Reason:** ${reason}`)] });
        await logModAction(interaction.guild, modEmbed);
    }
};
