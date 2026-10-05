const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embeds = require('../../utils/embeds');
const { updateGuildSetting, getGuildSettings } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Set the channel where moderation and server audit logs will be posted')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The log channel (leave empty to disable logging)')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        if (!channel) {
            updateGuildSetting(interaction.guild.id, 'mod_log_channel', null);
            return interaction.reply({ embeds: [embeds.info('Mod Logs Disabled', 'Moderation and audit logging have been disabled.')] });
        }

        updateGuildSetting(interaction.guild.id, 'mod_log_channel', channel.id);

        await interaction.reply({ 
            embeds: [embeds.success('Mod Logs Configured', `Audit and moderation logs will now be sent to <#${channel.id}>.`)] 
        });
    }
};
