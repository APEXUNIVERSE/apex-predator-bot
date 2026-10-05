const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { logModAction } = require('../../utils/modLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk delete messages from the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Only delete messages from this user')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('Filter messages to delete')
                .setRequired(false)
                .addChoices(
                    { name: 'Bots Only', value: 'bots' },
                    { name: 'Humans Only', value: 'humans' },
                    { name: 'Contains Links', value: 'links' },
                    { name: 'Contains Attachments', value: 'attachments' }
                )),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const target = interaction.options.getUser('target');
        const filter = interaction.options.getString('filter');

        await interaction.deferReply({ ephemeral: true });

        const messages = await interaction.channel.messages.fetch({ limit: amount });
        let filtered = messages;

        if (target) {
            filtered = filtered.filter(m => m.author.id === target.id);
        }

        if (filter === 'bots') {
            filtered = filtered.filter(m => m.author.bot);
        } else if (filter === 'humans') {
            filtered = filtered.filter(m => !m.author.bot);
        } else if (filter === 'links') {
            filtered = filtered.filter(m => /(https?:\/\/[^\s]+)/g.test(m.content));
        } else if (filter === 'attachments') {
            filtered = filtered.filter(m => m.attachments.size > 0);
        }

        if (filtered.size === 0) {
            return interaction.editReply({ embeds: [embeds.warning('Purge', 'No messages found matching the specified criteria within the fetched range.')] });
        }

        const deleted = await interaction.channel.bulkDelete(filtered, true).catch(err => {
            return null;
        });

        if (!deleted) {
            return interaction.editReply({ 
                embeds: [embeds.error('Error', 'Failed to purge messages. Note: Discord does not permit deleting messages older than 14 days in bulk.')] 
            });
        }

        const modEmbed = embeds.modAction({
            action: 'Purge Messages',
            target: target ? target.tag : 'All matching',
            moderator: interaction.user,
            reason: `Purged ${deleted.size} messages in #${interaction.channel.name}`,
            extra: {
                'Channel': `#${interaction.channel.name}`,
                'Deleted Count': deleted.size,
                'Filter': filter || 'None'
            }
        });

        await interaction.editReply({ embeds: [embeds.success('Purge Complete', `Successfully deleted **${deleted.size}** message(s).`)] });
        await logModAction(interaction.guild, modEmbed);
    }
};
