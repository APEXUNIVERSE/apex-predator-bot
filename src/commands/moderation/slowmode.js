const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embeds = require('../../utils/embeds');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode rate limit for a text channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Slowmode in seconds (0 to disable, max 21600 = 6 hours)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set slowmode on (defaults to current channel)')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)),

    async execute(interaction) {
        const seconds = interaction.options.getInteger('seconds');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.setRateLimitPerUser(seconds, `Slowmode set by ${interaction.user.tag}`);

            const text = seconds === 0 ? 'Slowmode has been disabled.' : `Slowmode set to **${seconds} second(s)**.`;

            const modEmbed = embeds.modAction({
                action: 'Slowmode Change',
                target: `#${channel.name}`,
                moderator: interaction.user,
                reason: `Set slowmode to ${seconds}s in #${channel.name}`
            });

            await interaction.reply({ embeds: [embeds.success('Slowmode Updated', `${text} in <#${channel.id}>.`)] });
            await logModAction(interaction.guild, modEmbed);
        } catch (err) {
            return interaction.reply({ embeds: [embeds.error('Error', `Failed to set slowmode: ${err.message}`)], ephemeral: true });
        }
    }
};
