const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { clearWarnings } = require('../../database/db');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Clear all warnings for a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user whose warnings you want to clear')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const res = clearWarnings(interaction.guild.id, target.id);

        const modEmbed = embeds.modAction({
            action: 'Clear All Warnings',
            target,
            moderator: interaction.user,
            reason: 'Administrative Reset',
            extra: { 'Warnings Cleared': res.changes }
        });

        await interaction.reply({ 
            embeds: [embeds.success('Warnings Cleared', `Successfully cleared **${res.changes}** warning(s) for **${target.tag}**.`)] 
        });
        await logModAction(interaction.guild, modEmbed);
    }
};
