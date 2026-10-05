const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embeds = require('../../utils/embeds');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel to prevent regular members from sending messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to lock (defaults to current channel)')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for locking channel')
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'Channel lockdown';

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false,
                AddReactions: false
            }, { reason: `${reason} (Locked by ${interaction.user.tag})` });

            const modEmbed = embeds.modAction({
                action: 'Channel Lock',
                target: `#${channel.name}`,
                moderator: interaction.user,
                reason,
                extra: { 'Channel': `<#${channel.id}>` }
            });

            await channel.send({
                embeds: [embeds.warning('🔒 Channel Locked', `This channel has been locked by a moderator.\n**Reason:** ${reason}`)]
            });

            await interaction.reply({ 
                embeds: [embeds.success('Channel Locked', `Successfully locked <#${channel.id}>.`)], 
                ephemeral: true 
            });

            await logModAction(interaction.guild, modEmbed);
        } catch (err) {
            return interaction.reply({ embeds: [embeds.error('Error', `Failed to lock channel: ${err.message}`)], ephemeral: true });
        }
    }
};
