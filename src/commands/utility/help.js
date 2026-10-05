const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder 
} = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display available commands and server management capabilities'),

    async execute(interaction) {
        const homeEmbed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🛡️ Discord Server Management Bot - Command Directory')
            .setDescription('Welcome to the command dashboard! Select a category from the dropdown menu below to view detailed command instructions.')
            .addFields(
                { name: '🔨 Moderation', value: '`/ban`, `/unban`, `/kick`, `/timeout`, `/untimeout`, `/warn`, `/warnings`, `/delwarn`, `/clearwarns`, `/purge`, `/lock`, `/unlock`, `/slowmode`, `/nick`', inline: false },
                { name: '⚙️ Administration & Setup', value: '`/setlogs`, `/setwelcome`, `/setleave`, `/setautorole`, `/automod`, `/ticket-setup`, `/reactionrole`', inline: false },
                { name: '📊 Information & Utility', value: '`/serverinfo`, `/userinfo`, `/botinfo`, `/ping`, `/help`', inline: false }
            )
            .setFooter({ text: 'Select a category below for in-depth command usage' })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category_select')
            .setPlaceholder('Select a category to view commands...')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Overview')
                    .setDescription('Return to the main help overview')
                    .setEmoji('🏠')
                    .setValue('help_home'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Moderation Commands')
                    .setDescription('Ban, kick, timeout, warn, purge, lockdown tools')
                    .setEmoji('🔨')
                    .setValue('help_mod'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Admin & Setup')
                    .setDescription('AutoMod, logs, welcome greetings, tickets, autorole')
                    .setEmoji('⚙️')
                    .setValue('help_admin'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Utility & Stats')
                    .setDescription('Server statistics, user info, bot metrics, ping')
                    .setEmoji('📊')
                    .setValue('help_util')
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ embeds: [homeEmbed], components: [row] });
    }
};
