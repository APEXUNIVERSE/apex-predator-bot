const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { getWarnings } = require('../../database/db');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View all warnings of a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user whose warnings you want to view')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const warns = getWarnings(interaction.guild.id, target.id);

        if (!warns || warns.length === 0) {
            return interaction.reply({ 
                embeds: [embeds.info('Warnings History', `**${target.tag}** has no warnings.`)] 
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle(`Warnings History: ${target.tag}`)
            .setDescription(`Total Warnings: **${warns.length}**`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        warns.slice(0, 10).forEach((w, idx) => {
            const date = new Date(w.timestamp).toLocaleDateString();
            embed.addFields({
                name: `#${w.id} | Date: ${date}`,
                value: `**Moderator:** <@${w.moderator_id}>\n**Reason:** ${w.reason}`
            });
        });

        if (warns.length > 10) {
            embed.setFooter({ text: `Showing 10 most recent of ${warns.length} warnings. Use /delwarn to remove specific warnings.` });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
