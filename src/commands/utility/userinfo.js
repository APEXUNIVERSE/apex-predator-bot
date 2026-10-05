const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get detailed information about a user')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('The user to get information on (defaults to yourself)')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        const createdTimestamp = Math.floor(user.createdTimestamp / 1000);
        const embed = new EmbedBuilder()
            .setColor(member?.displayColor || config.colors.primary)
            .setTitle(`👤 User Info: ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 User ID', value: `\`${user.id}\``, inline: true },
                { name: '🤖 Bot Account', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: '📅 Account Created', value: `<t:${createdTimestamp}:F>\n(<t:${createdTimestamp}:R>)`, inline: false }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        if (member) {
            const joinedTimestamp = Math.floor(member.joinedTimestamp / 1000);
            const roles = member.roles.cache
                .filter(r => r.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(r => `<@&${r.id}>`);

            embed.addFields(
                { name: '📥 Joined Server', value: `<t:${joinedTimestamp}:F>\n(<t:${joinedTimestamp}:R>)`, inline: false },
                { name: `🏷️ Roles (${roles.length})`, value: roles.length > 0 ? (roles.length > 15 ? roles.slice(0, 15).join(', ') + ` and ${roles.length - 15} more...` : roles.join(', ')) : 'None', inline: false }
            );

            if (member.nickname) {
                embed.addFields({ name: '📛 Nickname', value: member.nickname, inline: true });
            }
        }

        await interaction.reply({ embeds: [embed] });
    }
};
