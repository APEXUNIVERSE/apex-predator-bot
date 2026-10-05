const { 
    ChannelType, 
    PermissionFlagsBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const logger = require('../utils/logger');
const embeds = require('../utils/embeds');
const { getGuildSettings, createTicket, getTicketByChannel, closeTicket, getInvites } = require('../database/db');
const config = require('../config');

// Apex Universe Constant IDs
const VERIFIED_OPERATOR_ROLE_ID = '1539938913173372980';
const WARZONE_SLAYER_ROLE_ID = '1539938915518255135';
const GAMER_TAGS_CHANNEL_ID = '1539942545944084561';
const OPERATOR_WELCOME_CHANNEL_ID = '1539942509550247956';
const GENERAL_INTEL_CHANNEL_ID = '1539942530752454686';
const VERIFY_CHANNEL_ID = '1539942524578304052';

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // -------------------------------------------------------------
        // 1. Handle Slash Commands
        // -------------------------------------------------------------
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                logger.warn(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(`Error executing ${interaction.commandName}:`, error);
                const replyMethod = interaction.replied || interaction.deferred ? 'editReply' : 'reply';
                await interaction[replyMethod]({
                    embeds: [embeds.error('Command Error', 'An unexpected error occurred while executing this command.')],
                    ephemeral: true
                }).catch(() => null);
            }
            return;
        }

        // -------------------------------------------------------------
        // 2. Handle String Select Menu
        // -------------------------------------------------------------
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'help_category_select') {
                const selected = interaction.values[0];

                if (selected === 'help_home') {
                    const embed = new EmbedBuilder()
                        .setColor(config.colors.primary)
                        .setTitle('🛡️ Discord Server Management Bot - Command Directory')
                        .setDescription('Welcome to the command dashboard! Select a category from the dropdown menu below to view detailed command instructions.')
                        .addFields(
                            { name: '🔨 Moderation', value: '`/ban`, `/unban`, `/kick`, `/timeout`, `/untimeout`, `/warn`, `/warnings`, `/delwarn`, `/clearwarns`, `/purge`, `/lock`, `/unlock`, `/slowmode`, `/nick`', inline: false },
                            { name: '⚙️ Administration & Setup', value: '`/setlogs`, `/setwelcome`, `/setleave`, `/setautorole`, `/automod`, `/ticket-setup`, `/reactionrole`', inline: false },
                            { name: '📊 Information & Utility', value: '`/serverinfo`, `/userinfo`, `/botinfo`, `/ping`, `/help`, `/myinvite`, `/invites`', inline: false }
                        )
                        .setTimestamp();
                    return interaction.update({ embeds: [embed] });
                }

                if (selected === 'help_mod') {
                    const embed = new EmbedBuilder()
                        .setColor(config.colors.mod)
                        .setTitle('🔨 Moderation Commands')
                        .setDescription('Essential moderation and enforcement commands for server staff:')
                        .addFields(
                            { name: '`/ban <target> [reason] [delete_days]`', value: 'Ban a member and optionally purge up to 7 days of messages.' },
                            { name: '`/unban <user_id> [reason]`', value: 'Revoke a ban for a user by their Discord User ID.' },
                            { name: '`/kick <target> [reason]`', value: 'Kick a member from the server.' },
                            { name: '`/timeout <target> <duration> <unit> [reason]`', value: 'Mute/Timeout a member (Minutes, Hours, Days).' },
                            { name: '`/untimeout <target> [reason]`', value: 'Remove an active timeout from a member.' },
                            { name: '`/warn <target> <reason>`', value: 'Issue an official warning recorded in database and sent via DM.' },
                            { name: '`/warnings <target>`', value: 'View warning log history for a user.' },
                            { name: '`/delwarn <warn_id>` / `/clearwarns <target>`', value: 'Delete a single warning or clear all warnings.' },
                            { name: '`/purge <amount> [target] [filter]`', value: 'Bulk delete messages with optional bots/humans/links filters.' },
                            { name: '`/lock [channel] [reason]` / `/unlock [channel]`', value: 'Lockdown or unlock a channel for regular members.' },
                            { name: '`/slowmode <seconds> [channel]`', value: 'Adjust channel chat rate limit.' },
                            { name: '`/nick <target> [nickname]`', value: 'Change or reset a member\'s nickname.' }
                        );
                    return interaction.update({ embeds: [embed] });
                }

                if (selected === 'help_admin') {
                    const embed = new EmbedBuilder()
                        .setColor(config.colors.primary)
                        .setTitle('⚙️ Administration & Configuration Commands')
                        .setDescription('Server customization, automod rules, onboarding, and ticket system setup:')
                        .addFields(
                            { name: '`/setlogs [channel]`', value: 'Set or disable the central audit & moderation log channel.' },
                            { name: '`/setwelcome <enabled> [channel] [message]`', value: 'Configure welcome greeting channel and custom message template.' },
                            { name: '`/setleave <enabled> [channel] [message]`', value: 'Configure goodbye farewell notifications.' },
                            { name: '`/setautorole [role]`', value: 'Automatically give a role to newcomers on join.' },
                            { name: '`/automod status / antispam / antiinvites / antilinks / antimention / badwords`', value: 'Configure AI and heuristic automated moderation protection filters.' },
                            { name: '`/ticket-setup <channel> <category> [title] [description]`', value: 'Send an interactive support ticket panel.' },
                            { name: '`/reactionrole <channel> <role> <button_label> [desc] [emoji]`', value: 'Create a button-based self-assignable role menu.' }
                        );
                    return interaction.update({ embeds: [embed] });
                }

                if (selected === 'help_util') {
                    const embed = new EmbedBuilder()
                        .setColor(config.colors.info)
                        .setTitle('📊 Utility & Info Commands')
                        .setDescription('Informational and server diagnostic commands:')
                        .addFields(
                            { name: '`/serverinfo`', value: 'Comprehensive server statistics, channels, roles, and boost status.' },
                            { name: '`/userinfo [target]`', value: 'View account details, permissions, and join dates.' },
                            { name: '`/myinvite`', value: 'Generate your personal tracking invite link and check rewards.' },
                            { name: '`/invites [target]`', value: 'Check your or another member\'s total verified recruits.' },
                            { name: '`/botinfo`', value: 'Bot health metrics, memory usage, uptime, and cluster details.' },
                            { name: '`/ping`', value: 'Check roundtrip latency and Discord WebSocket ping.' },
                            { name: '`/help`', value: 'Open this interactive command directory.' }
                        );
                    return interaction.update({ embeds: [embed] });
                }
            }
        }

        // -------------------------------------------------------------
        // 3. Handle Button Clicks
        // -------------------------------------------------------------
        if (interaction.isButton()) {
            const { customId, guild, member, user } = interaction;

            // --- A. GENERATE USER INVITE LINK & SHOW REWARDS ---
            if (customId === 'generate_user_invite_btn') {
                await interaction.deferReply({ ephemeral: true });

                try {
                    // Create a unique tracking invite on verify or welcome channel
                    const targetChannel = guild.channels.cache.get(VERIFY_CHANNEL_ID) || 
                                          guild.channels.cache.get(OPERATOR_WELCOME_CHANNEL_ID) || 
                                          guild.channels.cache.find(c => c.isTextBased());

                    const invite = await targetChannel.createInvite({
                        maxAge: 0,
                        maxUses: 0,
                        unique: true,
                        reason: `Personal Tracking Invite for ${user.tag}`
                    });

                    // Add to client invite cache
                    if (!client.invites) client.invites = new Map();
                    const guildInvMap = client.invites.get(guild.id) || new Map();
                    guildInvMap.set(invite.code, invite.uses);
                    client.invites.set(guild.id, guildInvMap);

                    // Fetch user's current stats
                    const currentInvites = getInvites(guild.id, user.id);

                    const inviteCard = new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('🚀 Your Personal Tracking Invite Link is Ready!')
                        .setDescription(
                            `Hey **${member.displayName}**! Here is your exclusive invite link:\n\n` +
                            `🔗 **\`${invite.url}\`** *(Never Expires • Unlimited Uses)*\n\n` +
                            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                            `### 📊 Your Recruitment Stats:\n` +
                            `• 🎯 **Verified Recruits:** \`${currentInvites} Friends\`\n` +
                            `• 🎖️ **Next Milestone:** ${currentInvites < 1 ? '`1 Recruit` needed for **🔥 Daily Grinder**' : currentInvites < 5 ? `\`${5 - currentInvites}\` more needed for **💎 Community Elite**` : currentInvites < 10 ? `\`${10 - currentInvites}\` more needed for **⭐ Task Force Director & VIP**` : '**Maximum VIP Status Achieved! 🏆**'}\n\n` +
                            `### 🎁 Recruitment Rewards Ladder:\n` +
                            `• **1 Friend Joined:** 🔥 \`Daily Grinder\` Role\n` +
                            `• **5 Friends Joined:** 💎 \`Community Elite\` Role\n` +
                            `• **10 Friends Joined:** ⭐ \`Task Force Director\` & VIP Champion Ranks!\n\n` +
                            `*Whenever someone joins through your link, you will receive an automatic shout-out in <#${GENERAL_INTEL_CHANNEL_ID}> and instant role promotions!* 💣🎧`
                        )
                        .setFooter({ text: 'Share this link anywhere on WhatsApp, Discord, or Social Media!' })
                        .setTimestamp();

                    const shareRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('🌐 Official Website Portal')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://www.apexuniverse.online/')
                    );

                    return interaction.editReply({ embeds: [inviteCard], components: [shareRow] });
                } catch (err) {
                    logger.error('Error generating personal invite:', err);
                    return interaction.editReply({ 
                        content: '❌ Failed to generate invite link. Please make sure the bot has `Create Instant Invite` permissions.',
                        ephemeral: true 
                    });
                }
            }

            // --- B. OPERATOR VERIFICATION BUTTON ---
            if (customId === 'verify_operator_btn' || customId.includes('verify')) {
                const modal = new ModalBuilder()
                    .setCustomId('apex_operator_verify_modal')
                    .setTitle('🛡️ Operator Verification');

                const gamertagInput = new TextInputBuilder()
                    .setCustomId('operator_gamertag')
                    .setLabel('Activision ID / Gamertag')
                    .setPlaceholder('e.g. Ghost#1234567 / ApexWarrior')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(50);

                const clanInput = new TextInputBuilder()
                    .setCustomId('operator_clantag')
                    .setLabel('Clan Tag (Optional)')
                    .setPlaceholder('e.g. [APEX]')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
                    .setMaxLength(10);

                const platformRoleInput = new TextInputBuilder()
                    .setCustomId('operator_platform_role')
                    .setLabel('Platform & Preferred Combat Role')
                    .setPlaceholder('e.g. PC / Entry Fragger or PS5 / Sniper Specialist')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(100);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(gamertagInput),
                    new ActionRowBuilder().addComponents(clanInput),
                    new ActionRowBuilder().addComponents(platformRoleInput)
                );

                return interaction.showModal(modal);
            }

            // --- C. Create Support Ticket ---
            if (customId === 'ticket_create' || customId.includes('ticket')) {
                await interaction.deferReply({ ephemeral: true });

                try {
                    const settings = getGuildSettings(guild.id);
                    const categoryId = settings?.ticket_category_id;

                    const category = categoryId ? await guild.channels.fetch(categoryId).catch(() => null) : null;
                    const cleanUsername = user.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 10) || 'user';
                    const ticketChannelName = `ticket-${cleanUsername}-${Math.floor(1000 + Math.random() * 9000)}`;

                    // Build permission overwrites
                    const permissionOverwrites = [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.ReadMessageHistory,
                                PermissionFlagsBits.EmbedLinks
                            ]
                        },
                        {
                            id: client.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ManageChannels,
                                PermissionFlagsBits.EmbedLinks,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }
                    ];

                    // Also allow server staff roles to view ticket
                    const staffRoles = guild.roles.cache.filter(r => 
                        r.permissions.has(PermissionFlagsBits.Administrator) ||
                        r.permissions.has(PermissionFlagsBits.ManageGuild) ||
                        r.name.includes('Enforcer') ||
                        r.name.includes('Advisor') ||
                        r.name.includes('Director') ||
                        r.name.includes('Staff') ||
                        r.name.includes('Mod')
                    );

                    staffRoles.forEach(role => {
                        permissionOverwrites.push({
                            id: role.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.ReadMessageHistory,
                                PermissionFlagsBits.EmbedLinks
                            ]
                        });
                    });

                    const ticketChannel = await guild.channels.create({
                        name: ticketChannelName,
                        type: ChannelType.GuildText,
                        parent: category ? category.id : null,
                        topic: `Support ticket for ${user.tag} (${user.id})`,
                        permissionOverwrites
                    });

                    createTicket(guild.id, ticketChannel.id, user.id);

                    const ticketEmbed = new EmbedBuilder()
                        .setColor(0xE63946)
                        .setTitle('🎫 Support Ticket Opened')
                        .setDescription(`Welcome <@${user.id}>! A member of the Apex Universe Staff Team will assist you shortly.\n\n### 📝 Please Provide:\n• A detailed description of your question or issue\n• Any screenshots, clip links, or Gamertags/Activision IDs if applicable`)
                        .setFooter({ text: 'Click "Close Ticket" below when your inquiry is resolved.' })
                        .setTimestamp();

                    const closeRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('ticket_close')
                            .setLabel('Close Ticket')
                            .setEmoji('🔒')
                            .setStyle(ButtonStyle.Danger)
                    );

                    await ticketChannel.send({ content: `<@${user.id}> | Staff ping: <@&${VERIFIED_OPERATOR_ROLE_ID}>`, embeds: [ticketEmbed], components: [closeRow] });

                    return interaction.editReply({
                        content: `✅ Your private support ticket has been created: <#${ticketChannel.id}>`
                    });
                } catch (ticketErr) {
                    logger.error('Error creating support ticket:', ticketErr);
                    return interaction.editReply({
                        content: '❌ Failed to create support ticket channel. Please check that the bot has `Manage Channels` permissions in this server.'
                    });
                }
            }

            // --- D. Close Support Ticket ---
            if (customId === 'ticket_close') {
                await interaction.deferReply();

                try {
                    const ticket = getTicketByChannel(interaction.channel.id);
                    closeTicket(interaction.channel.id, user.tag);

                    if (ticket) {
                        await interaction.channel.permissionOverwrites.edit(ticket.user_id, {
                            SendMessages: false
                        }).catch(() => null);
                    }

                    const closedEmbed = new EmbedBuilder()
                        .setColor(config.colors.warning)
                        .setTitle('🔒 Ticket Closed')
                        .setDescription(`This ticket was marked closed by <@${user.id}>.`)
                        .setTimestamp();

                    const deleteRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('ticket_delete')
                            .setLabel('Delete Channel')
                            .setEmoji('🗑️')
                            .setStyle(ButtonStyle.Danger)
                    );

                    return interaction.editReply({ embeds: [closedEmbed], components: [deleteRow] });
                } catch (closeErr) {
                    logger.error('Error closing ticket:', closeErr);
                    return interaction.editReply({ content: '❌ Error closing ticket.' });
                }
            }

            // --- E. Delete Ticket Channel ---
            if (customId === 'ticket_delete') {
                await interaction.reply({ content: '🗑️ Deleting ticket channel in 3 seconds...' });
                setTimeout(async () => {
                    await interaction.channel.delete().catch(() => null);
                }, 3000);
                return;
            }

            // --- F. Handle Reaction Roles Toggle ---
            if (customId.startsWith('role_toggle_')) {
                const roleId = customId.replace('role_toggle_', '');
                const role = await guild.roles.fetch(roleId).catch(() => null);

                if (!role) {
                    return interaction.reply({ embeds: [embeds.error('Error', 'The role associated with this button no longer exists.')], ephemeral: true });
                }

                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    return interaction.reply({ 
                        embeds: [embeds.info('Role Removed', `Removed the **${role.name}** role from your profile.`)], 
                        ephemeral: true 
                    });
                } else {
                    await member.roles.add(roleId);
                    return interaction.reply({ 
                        embeds: [embeds.success('Role Added', `Assigned the **${role.name}** role to your profile.`)], 
                        ephemeral: true 
                    });
                }
            }
        }

        // -------------------------------------------------------------
        // 4. Handle Modal Submissions (Verification)
        // -------------------------------------------------------------
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'apex_operator_verify_modal') {
                await interaction.deferReply({ ephemeral: true });
                const { guild, member, user } = interaction;
                const gamertag = interaction.fields.getTextInputValue('operator_gamertag');
                const clantag = interaction.fields.getTextInputValue('operator_clantag') || 'N/A';
                const platformRole = interaction.fields.getTextInputValue('operator_platform_role');

                // Assign Roles
                try {
                    const verifiedRole = guild.roles.cache.get(VERIFIED_OPERATOR_ROLE_ID) || guild.roles.cache.find(r => r.name.includes('Verified Operator'));
                    const slayerRole = guild.roles.cache.get(WARZONE_SLAYER_ROLE_ID) || guild.roles.cache.find(r => r.name.includes('Warzone Slayer'));

                    if (verifiedRole) await member.roles.add(verifiedRole);
                    if (slayerRole) await member.roles.add(slayerRole);
                } catch (roleErr) {
                    logger.error('Error assigning verification roles:', roleErr);
                }

                // Ephemeral confirmation to user
                const successEmbed = new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle('🪖 Operator Verification Approved!')
                    .setDescription(`Welcome to the active roster, <@${user.id}>!\n\n**Gamertag:** \`${gamertag}\`\n**Clan Tag:** \`${clantag}\`\n**Role & Platform:** \`${platformRole}\`\n\n✅ **Unlocked Sectors:**\n• <#${OPERATOR_WELCOME_CHANNEL_ID}>\n• <#${GENERAL_INTEL_CHANNEL_ID}> (General Intel)\n• <#${GAMER_TAGS_CHANNEL_ID}> (Gamer Tags)\n• All Warzone Squad Lobbies & Comms Channels!`)
                    .setFooter({ text: 'Apex Universe • Combat Clearance Granted' })
                    .setTimestamp();

                const inviteBtnRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('generate_user_invite_btn')
                        .setLabel('🚀 Invite Friends & Earn Rewards')
                        .setEmoji('🎁')
                        .setStyle(ButtonStyle.Success)
                );

                await interaction.editReply({ embeds: [successEmbed], components: [inviteBtnRow] });

                // Post Operator Profile in #gamer-tags
                try {
                    const gamerTagsChannel = guild.channels.cache.get(GAMER_TAGS_CHANNEL_ID) || guild.channels.cache.find(c => c.name.includes('gamer-tags'));
                    if (gamerTagsChannel) {
                        const profileEmbed = new EmbedBuilder()
                            .setColor(0xED4245)
                            .setTitle('🎯 New Operator Profile Deployed')
                            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                { name: '👤 Operator', value: `<@${user.id}> (\`${user.username}\`)`, inline: true },
                                { name: '🎮 Activision Gamertag', value: `\`${gamertag}\``, inline: true },
                                { name: '🛡️ Clan Tag', value: `\`${clantag}\``, inline: true },
                                { name: '⚡ Platform / Combat Role', value: `\`${platformRole}\``, inline: false }
                            )
                            .setFooter({ text: 'Apex Universe Active Roster' })
                            .setTimestamp();

                        await gamerTagsChannel.send({ embeds: [profileEmbed] });
                    }
                } catch (tagErr) {
                    logger.error('Error posting to gamer-tags channel:', tagErr);
                }

                // Post Welcome Notification in #operator-welcome
                try {
                    const welcomeChannel = guild.channels.cache.get(OPERATOR_WELCOME_CHANNEL_ID) || guild.channels.cache.find(c => c.name.includes('welcome'));
                    if (welcomeChannel) {
                        const welcomeEmbed = new EmbedBuilder()
                            .setColor(0xE74C3C)
                            .setDescription(`🪖 **Attention Squad:** Operator <@${user.id}> has completed clearance and verified their loadout! Welcome to **Apex Universe**! 🚀🔥`)
                            .setTimestamp();

                        await welcomeChannel.send({ embeds: [welcomeEmbed] });
                    }
                } catch (welErr) {
                    logger.error('Error posting to welcome channel:', welErr);
                }

                logger.info(`Operator ${user.tag} verified successfully with Gamertag: ${gamertag}`);
            }
        }
    }
};
