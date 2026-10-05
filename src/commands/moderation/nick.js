const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Change or reset a member\'s nickname')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member whose nickname to change')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('The new nickname (leave empty to reset to username)')
                .setRequired(false)
                .setMaxLength(32)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const newNick = interaction.options.getString('nickname') || null;

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [embeds.error('Error', 'This user is not in the server.')], ephemeral: true });
        }

        if (!member.manageable) {
            return interaction.reply({ embeds: [embeds.error('Error', 'I cannot manage this member\'s nickname. Their role is higher than mine.')], ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({ embeds: [embeds.error('Error', 'You cannot change nickname of someone with a role equal to or higher than yours.')], ephemeral: true });
        }

        const oldNick = member.displayName;
        await member.setNickname(newNick, `Nickname changed by ${interaction.user.tag}`);

        const modEmbed = embeds.modAction({
            action: 'Nickname Change',
            target,
            moderator: interaction.user,
            reason: `Changed nickname from "${oldNick}" to "${newNick || target.username}"`
        });

        const replyText = newNick 
            ? `Successfully changed **${target.tag}**'s nickname to **${newNick}**.` 
            : `Successfully reset **${target.tag}**'s nickname.`;

        await interaction.reply({ embeds: [embeds.success('Nickname Changed', replyText)] });
        await logModAction(interaction.guild, modEmbed);
    }
};
