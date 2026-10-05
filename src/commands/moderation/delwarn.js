const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { deleteWarning } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delwarn')
        .setDescription('Delete a specific warning by its ID')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addIntegerOption(option => 
            option.setName('warn_id')
                .setDescription('The Warning ID (viewable with /warnings)')
                .setRequired(true)),

    async execute(interaction) {
        const warnId = interaction.options.getInteger('warn_id');
        const res = deleteWarning(interaction.guild.id, warnId);

        if (res.changes > 0) {
            await interaction.reply({ embeds: [embeds.success('Warning Removed', `Successfully deleted warning with ID \`#${warnId}\`.`)] });
        } else {
            await interaction.reply({ embeds: [embeds.error('Not Found', `No warning found with ID \`#${warnId}\` in this server.`)], ephemeral: true });
        }
    }
};
