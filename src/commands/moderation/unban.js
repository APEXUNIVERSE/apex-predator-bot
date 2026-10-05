const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user by their User ID')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option => 
            option.setName('user_id')
                .setDescription('The ID of the user to unban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for unbanning')
                .setRequired(false)),

    async execute(interaction) {
        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const banInfo = await interaction.guild.bans.fetch(userId).catch(() => null);
            if (!banInfo) {
                return interaction.reply({ embeds: [embeds.error('Not Found', `User with ID \`${userId}\` is not banned.`)], ephemeral: true });
            }

            await interaction.guild.members.unban(userId, `${reason} (Unbanned by ${interaction.user.tag})`);

            const modEmbed = embeds.modAction({
                action: 'Unban',
                target: banInfo.user,
                moderator: interaction.user,
                reason
            });

            await interaction.reply({ embeds: [embeds.success('User Unbanned', `Successfully unbanned **${banInfo.user.tag}** (\`${userId}\`).\n**Reason:** ${reason}`)] });
            await logModAction(interaction.guild, modEmbed);
        } catch (err) {
            return interaction.reply({ embeds: [embeds.error('Error', `Failed to unban user: ${err.message}`)], ephemeral: true });
        }
    }
};
