const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { updateGuildSetting } = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setautorole')
        .setDescription('Set the role automatically assigned to new joining members')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to assign (leave empty to disable autorole)')
                .setRequired(false)),

    async execute(interaction) {
        const role = interaction.options.getRole('role');

        if (!role) {
            updateGuildSetting(interaction.guild.id, 'autorole_id', null);
            return interaction.reply({ embeds: [embeds.info('Auto-Role Disabled', 'Auto-role on member join has been disabled.')] });
        }

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ 
                embeds: [embeds.error('Permission Error', 'I cannot assign this role because it is positioned higher than or equal to my highest role.')], 
                ephemeral: true 
            });
        }

        updateGuildSetting(interaction.guild.id, 'autorole_id', role.id);

        await interaction.reply({ 
            embeds: [embeds.success('Auto-Role Configured', `New members will automatically receive <@&${role.id}> upon joining.`)] 
        });
    }
};
