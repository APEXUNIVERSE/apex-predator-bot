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
const { updateGuildSetting } = require('../../database/db');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Create an interactive ticket support panel in a channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('The channel where the ticket panel will be posted')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addChannelOption(opt =>
            opt.setName('category')
                .setDescription('The category where new ticket channels will be created')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('title')
                .setDescription('Custom title for the ticket panel')
                .setRequired(false))
        .addStringOption(opt =>
            opt.setName('description')
                .setDescription('Custom description explaining the ticket system')
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const category = interaction.options.getChannel('category');
        const title = interaction.options.getString('title') || 'Support & Assistance';
        const description = interaction.options.getString('description') || 
            'Need help from our staff team? Click the button below to open a private support ticket.';

        updateGuildSetting(interaction.guild.id, 'ticket_category_id', category.id);

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🎫 ${title}`)
            .setDescription(description)
            .addFields(
                { name: 'How it works', value: '1. Click **Create Ticket** below.\n2. A private channel will be opened with our moderators.\n3. Describe your question or issue in detail.' }
            )
            .setFooter({ text: `${interaction.guild.name} • Support System`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_create')
                .setLabel('Create Ticket')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary)
        );

        await channel.send({ embeds: [embed], components: [row] });

        await interaction.reply({ 
            embeds: [embeds.success('Ticket Panel Created', `Ticket panel successfully sent to <#${channel.id}>. New tickets will be opened under category **${category.name}**.`)] 
        });
    }
};
