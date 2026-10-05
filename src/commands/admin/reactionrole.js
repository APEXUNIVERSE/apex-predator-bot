const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ChannelType, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const embeds = require('../../utils/embeds');
const { addReactionRole } = require('../../database/db');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Create a button-based self-assignable role message')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('The channel to send the role panel in')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addRoleOption(opt =>
            opt.setName('role')
                .setDescription('The role to give/remove on click')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('button_label')
                .setDescription('The text shown on the button')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('description')
                .setDescription('Description text in the panel')
                .setRequired(false))
        .addStringOption(opt =>
            opt.setName('emoji')
                .setDescription('Emoji for the button (e.g. ⭐, 🎮)')
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        const label = interaction.options.getString('button_label');
        const description = interaction.options.getString('description') || `Click the button below to get or remove the **${role.name}** role.`;
        const emoji = interaction.options.getString('emoji');

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ 
                embeds: [embeds.error('Role Hierarchy Error', 'I cannot manage this role because it is higher than or equal to my highest role.')], 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🏷️ Role Menu: ${role.name}`)
            .setDescription(description)
            .setFooter({ text: 'Click the button below to toggle this role' })
            .setTimestamp();

        const button = new ButtonBuilder()
            .setCustomId(`role_toggle_${role.id}`)
            .setLabel(label)
            .setStyle(ButtonStyle.Secondary);

        if (emoji) {
            try {
                button.setEmoji(emoji);
            } catch (e) {
                // ignore invalid emoji formatting
            }
        }

        const row = new ActionRowBuilder().addComponents(button);

        const msg = await channel.send({ embeds: [embed], components: [row] });
        addReactionRole(interaction.guild.id, channel.id, msg.id, role.id, emoji, label);

        await interaction.reply({ 
            embeds: [embeds.success('Role Panel Created', `Created role panel for <@&${role.id}> in <#${channel.id}>.`)] 
        });
    }
};
