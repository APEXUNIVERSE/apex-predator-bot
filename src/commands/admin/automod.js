const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { getGuildSettings, updateGuildSetting } = require('../../database/db');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure automated moderation and security filters')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('View current AutoMod protection status'))
        .addSubcommand(sub =>
            sub.setName('antispam')
                .setDescription('Toggle Anti-Spam (duplicate & rapid message protection)')
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('antiinvites')
                .setDescription('Toggle Discord Invite Link filtering')
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('antilinks')
                .setDescription('Toggle External Link filtering')
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('antimention')
                .setDescription('Toggle Anti-Mass Mention protection')
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('badwords')
                .setDescription('Manage prohibited words blacklist')
                .addStringOption(opt =>
                    opt.setName('action')
                        .setDescription('Action to perform')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Add Word', value: 'add' },
                            { name: 'Remove Word', value: 'remove' },
                            { name: 'List Words', value: 'list' },
                            { name: 'Clear All', value: 'clear' }
                        ))
                .addStringOption(opt =>
                    opt.setName('word')
                        .setDescription('Word to add or remove (lowercase)')
                        .setRequired(false))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const settings = getGuildSettings(interaction.guild.id);

        if (sub === 'status') {
            let badWordsList = [];
            try {
                badWordsList = JSON.parse(settings.automod_bad_words || '[]');
            } catch (e) {
                badWordsList = [];
            }

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`🛡️ AutoMod Configuration: ${interaction.guild.name}`)
                .addFields(
                    { name: 'Anti-Spam (Flood Detection)', value: settings.automod_anti_spam ? '✅ Enabled' : '❌ Disabled', inline: true },
                    { name: 'Anti-Invite Links', value: settings.automod_anti_invites ? '✅ Enabled' : '❌ Disabled', inline: true },
                    { name: 'Anti-External Links', value: settings.automod_anti_links ? '✅ Enabled' : '❌ Disabled', inline: true },
                    { name: 'Anti-Mass Mention (>5 mentions)', value: settings.automod_anti_mass_mention ? '✅ Enabled' : '❌ Disabled', inline: true },
                    { name: 'Blacklisted Words Count', value: `**${badWordsList.length}** word(s)`, inline: true }
                )
                .setFooter({ text: 'Use /automod <subcommand> to configure specific filters.' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'antispam') {
            const enabled = interaction.options.getBoolean('enabled');
            updateGuildSetting(interaction.guild.id, 'automod_anti_spam', enabled ? 1 : 0);
            return interaction.reply({ embeds: [embeds.success('AutoMod Updated', `Anti-Spam protection is now **${enabled ? 'Enabled' : 'Disabled'}**.`)] });
        }

        if (sub === 'antiinvites') {
            const enabled = interaction.options.getBoolean('enabled');
            updateGuildSetting(interaction.guild.id, 'automod_anti_invites', enabled ? 1 : 0);
            return interaction.reply({ embeds: [embeds.success('AutoMod Updated', `Anti-Invite protection is now **${enabled ? 'Enabled' : 'Disabled'}**.`)] });
        }

        if (sub === 'antilinks') {
            const enabled = interaction.options.getBoolean('enabled');
            updateGuildSetting(interaction.guild.id, 'automod_anti_links', enabled ? 1 : 0);
            return interaction.reply({ embeds: [embeds.success('AutoMod Updated', `Anti-Link protection is now **${enabled ? 'Enabled' : 'Disabled'}**.`)] });
        }

        if (sub === 'antimention') {
            const enabled = interaction.options.getBoolean('enabled');
            updateGuildSetting(interaction.guild.id, 'automod_anti_mass_mention', enabled ? 1 : 0);
            return interaction.reply({ embeds: [embeds.success('AutoMod Updated', `Anti-Mass Mention protection is now **${enabled ? 'Enabled' : 'Disabled'}**.`)] });
        }

        if (sub === 'badwords') {
            const action = interaction.options.getString('action');
            const word = interaction.options.getString('word')?.trim().toLowerCase();

            let words = [];
            try {
                words = JSON.parse(settings.automod_bad_words || '[]');
            } catch (e) {
                words = [];
            }

            if (action === 'add') {
                if (!word) {
                    return interaction.reply({ embeds: [embeds.error('Error', 'Please provide a word to add.')], ephemeral: true });
                }
                if (words.includes(word)) {
                    return interaction.reply({ embeds: [embeds.warning('Duplicate', `\`${word}\` is already in the blacklist.`)], ephemeral: true });
                }
                words.push(word);
                updateGuildSetting(interaction.guild.id, 'automod_bad_words', JSON.stringify(words));
                return interaction.reply({ embeds: [embeds.success('Word Added', `Added \`${word}\` to the prohibited words blacklist.`)] });
            }

            if (action === 'remove') {
                if (!word) {
                    return interaction.reply({ embeds: [embeds.error('Error', 'Please provide a word to remove.')], ephemeral: true });
                }
                if (!words.includes(word)) {
                    return interaction.reply({ embeds: [embeds.warning('Not Found', `\`${word}\` was not found in the blacklist.`)], ephemeral: true });
                }
                words = words.filter(w => w !== word);
                updateGuildSetting(interaction.guild.id, 'automod_bad_words', JSON.stringify(words));
                return interaction.reply({ embeds: [embeds.success('Word Removed', `Removed \`${word}\` from the prohibited words blacklist.`)] });
            }

            if (action === 'clear') {
                updateGuildSetting(interaction.guild.id, 'automod_bad_words', JSON.stringify([]));
                return interaction.reply({ embeds: [embeds.success('Blacklist Cleared', 'All prohibited words have been cleared.')] });
            }

            if (action === 'list') {
                if (words.length === 0) {
                    return interaction.reply({ embeds: [embeds.info('Bad Words Blacklist', 'No bad words are currently blacklisted.')] });
                }
                const formatted = words.map(w => `\`${w}\``).join(', ');
                return interaction.reply({ 
                    embeds: [embeds.info('Prohibited Words Blacklist', `Total: **${words.length}**\n\n${formatted}`)] 
                });
            }
        }
    }
};
