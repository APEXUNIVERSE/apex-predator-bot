const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout / Mute a member for a given duration')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration number')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('unit')
                .setDescription('Duration unit')
                .setRequired(true)
                .addChoices(
                    { name: 'Minutes', value: 'm' },
                    { name: 'Hours', value: 'h' },
                    { name: 'Days', value: 'd' }
                ))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for timeout')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const duration = interaction.options.getInteger('duration');
        const unit = interaction.options.getString('unit');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        let multiplier = 60 * 1000;
        let unitText = 'minute(s)';
        if (unit === 'h') {
            multiplier = 60 * 60 * 1000;
            unitText = 'hour(s)';
        } else if (unit === 'd') {
            multiplier = 24 * 60 * 60 * 1000;
            unitText = 'day(s)';
        }

        const totalMs = duration * multiplier;

        // Discord maximum timeout is 28 days
        if (totalMs > 28 * 24 * 60 * 60 * 1000) {
            return interaction.reply({ embeds: [embeds.error('Error', 'Maximum timeout duration is 28 days.')], ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [embeds.error('Error', 'This user is not in the server.')], ephemeral: true });
        }

        if (!member.moderatable) {
            return interaction.reply({ embeds: [embeds.error('Error', 'I cannot timeout this member. Their role may be higher than mine.')], ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({ embeds: [embeds.error('Error', 'You cannot timeout a member with a role equal to or higher than yours.')], ephemeral: true });
        }

        await member.timeout(totalMs, `${reason} (Timed out by ${interaction.user.tag})`);

        await target.send({
            embeds: [embeds.warning(`Timed out in ${interaction.guild.name}`, `**Duration:** ${duration} ${unitText}\n**Reason:** ${reason}`)]
        }).catch(() => null);

        const modEmbed = embeds.modAction({
            action: 'Timeout',
            target,
            moderator: interaction.user,
            reason,
            duration: `${duration} ${unitText}`
        });

        await interaction.reply({ embeds: [embeds.success('Member Timed Out', `Successfully timed out **${target.tag}** for **${duration} ${unitText}**.\n**Reason:** ${reason}`)] });
        await logModAction(interaction.guild, modEmbed);
    }
};
