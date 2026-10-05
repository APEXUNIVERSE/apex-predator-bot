const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embeds = require('../../utils/embeds');
const { updateGuildSetting } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Configure welcome greeting channel and message')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption(option =>
            option.setName('enabled')
                .setDescription('Enable or disable welcome messages')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel where welcome messages will be sent')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Custom welcome message (Variables: {user}, {server}, {memberCount})')
                .setRequired(false)),

    async execute(interaction) {
        const enabled = interaction.options.getBoolean('enabled');
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        updateGuildSetting(interaction.guild.id, 'welcome_enabled', enabled ? 1 : 0);

        if (channel) {
            updateGuildSetting(interaction.guild.id, 'welcome_channel', channel.id);
        }

        if (message) {
            updateGuildSetting(interaction.guild.id, 'welcome_message', message);
        }

        const statusText = enabled ? 'Enabled' : 'Disabled';
        let desc = `Welcome messages are now **${statusText}**.`;
        if (channel) desc += `\n**Channel:** <#${channel.id}>`;
        if (message) desc += `\n**Message Template:** \`${message}\``;

        await interaction.reply({ embeds: [embeds.success('Welcome Settings Updated', desc)] });
    }
};
