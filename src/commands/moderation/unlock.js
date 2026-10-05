const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embeds = require('../../utils/embeds');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a previously locked channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to unlock (defaults to current channel)')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for unlocking channel')
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'Channel unlock';

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null,
                AddReactions: null
            }, { reason: `${reason} (Unlocked by ${interaction.user.tag})` });

            const modEmbed = embeds.modAction({
                action: 'Channel Unlock',
                target: `#${channel.name}`,
                moderator: interaction.user,
                reason,
                extra: { 'Channel': `<#${channel.id}>` }
            });

            await channel.send({
                embeds: [embeds.success('🔓 Channel Unlocked', `This channel has been unlocked. Members can now send messages.`)]
            });

            await interaction.reply({ 
                embeds: [embeds.success('Channel Unlocked', `Successfully unlocked <#${channel.id}>.`)], 
                ephemeral: true 
            });

            await logModAction(interaction.guild, modEmbed);
        } catch (err) {
            return interaction.reply({ embeds: [embeds.error('Error', `Failed to unlock channel: ${err.message}`)], ephemeral: true });
        }
    }
};
