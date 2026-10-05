const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const { getGuildSettings, incrementInvite } = require('../database/db');
const logger = require('../utils/logger');
const embeds = require('../utils/embeds');
const { logModAction } = require('../utils/modLogger');
const config = require('../config');

// Apex Universe Channel & Role Constants
const GENERAL_INTEL_CHANNEL_ID = '1539942530752454686';
const OPERATOR_WELCOME_CHANNEL_ID = '1539942509550247956';
const VERIFY_CHANNEL_ID = '1539942524578304052';

const ROLE_1_INVITE = '1539969973324226561';  // 🔥 Daily Grinder
const ROLE_5_INVITES = '1539969976683995227'; // 💎 Community Elite
const ROLE_10_INVITES = '1539938367418929192'; // ⭐ Task Force Director
const ROLE_VIP_CHAMP = '1539938379066769449';  // 🏆 Warzone Champion

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const { guild } = member;
        const settings = getGuildSettings(guild.id);

        // -------------------------------------------------------------
        // 1. TRACK WHO INVITED THIS MEMBER
        // -------------------------------------------------------------
        let inviter = null;
        let usedInviteCode = null;

        try {
            const cachedInvites = client.invites?.get(guild.id) || new Map();
            const currentInvites = await guild.invites.fetch();

            for (const [code, inv] of currentInvites) {
                const cachedUses = cachedInvites.get(code) || 0;
                if (inv.uses > cachedUses) {
                    inviter = inv.inviter;
                    usedInviteCode = code;
                    break;
                }
            }

            // Update cache
            client.invites?.set(guild.id, new Map(currentInvites.map(inv => [inv.code, inv.uses])));
        } catch (err) {
            logger.warn(`Could not track invite for ${member.user.tag}: ${err.message}`);
        }

        // -------------------------------------------------------------
        // 2. REWARD INVITER & POST SHOUTOUT IN GENERAL INTEL
        // -------------------------------------------------------------
        if (inviter && !inviter.bot && inviter.id !== member.id) {
            const totalInvites = incrementInvite(guild.id, inviter.id, member.id);
            logger.info(`[INVITE TRACKER] ${inviter.tag} invited ${member.user.tag} (Total: ${totalInvites})`);

            // Fetch inviter member object
            const inviterMember = await guild.members.fetch(inviter.id).catch(() => null);
            let newlyUnlockedRole = null;

            if (inviterMember) {
                if (totalInvites >= 1) {
                    const r1 = guild.roles.cache.get(ROLE_1_INVITE);
                    if (r1 && !inviterMember.roles.cache.has(ROLE_1_INVITE)) {
                        await inviterMember.roles.add(r1).catch(() => null);
                        newlyUnlockedRole = r1.name;
                    }
                }
                if (totalInvites >= 5) {
                    const r5 = guild.roles.cache.get(ROLE_5_INVITES);
                    if (r5 && !inviterMember.roles.cache.has(ROLE_5_INVITES)) {
                        await inviterMember.roles.add(r5).catch(() => null);
                        newlyUnlockedRole = r5.name;
                    }
                }
                if (totalInvites >= 10) {
                    const r10 = guild.roles.cache.get(ROLE_10_INVITES);
                    const rVip = guild.roles.cache.get(ROLE_VIP_CHAMP);
                    if (r10 && !inviterMember.roles.cache.has(ROLE_10_INVITES)) {
                        await inviterMember.roles.add(r10).catch(() => null);
                        newlyUnlockedRole = r10.name;
                    }
                    if (rVip && !inviterMember.roles.cache.has(ROLE_VIP_CHAMP)) {
                        await inviterMember.roles.add(rVip).catch(() => null);
                    }
                }
            }

            // Public Celebratory Shout-out in #💬・general-intel
            const generalChannel = guild.channels.cache.get(GENERAL_INTEL_CHANNEL_ID) || 
                                   guild.channels.cache.find(c => c.name.includes('general-intel') || c.name.includes('general'));
            if (generalChannel && generalChannel.isTextBased()) {
                const shoutoutEmbed = new EmbedBuilder()
                    .setColor(0xF1C40F)
                    .setTitle('🚀 SQUAD RECRUITMENT SHOUTOUT! 🏆🔥')
                    .setDescription(
                        `**Massive appreciation to <@${inviter.id}>!** 👏\n\n` +
                        `Thank you for expanding our combat network and recruiting <@${member.id}> into **${guild.name}**!\n\n` +
                        `### 📊 Recruiter Stats for <@${inviter.id}>:\n` +
                        `• 🎯 **Total Verified Recruits:** \`${totalInvites} Operators\`\n` +
                        (newlyUnlockedRole ? `• 🎖️ **Milestone Role Unlocked:** **${newlyUnlockedRole}** 🎉\n` : `• 🎖️ **Recruiter Status:** Active Squad Builder\n`) +
                        `• 🎁 **Next Target Milestone:** ${totalInvites < 5 ? `\`${5 - totalInvites}\` more invites to unlock **💎 Community Elite**!` : totalInvites < 10 ? `\`${10 - totalInvites}\` more invites to unlock **⭐ Task Force Director & VIP Champion**!` : `**Maximum Prestige Achieved! 🏆**`}\n\n` +
                        `*Keep building the squad! Everyone give <@${inviter.id}> some love in the chat!* 💣🎧`
                    )
                    .setThumbnail(inviter.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({ text: 'Apex Universe • Community Growth Rewards' })
                    .setTimestamp();

                await generalChannel.send({ content: `🚨 **Attention Operators:** Big shoutout to <@${inviter.id}>!`, embeds: [shoutoutEmbed] }).catch(() => null);
            }

            // Send Thank-You DM to Inviter
            try {
                const thankDmEmbed = new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle('🎉 New Squad Member Joined With Your Link!')
                    .setDescription(
                        `Hey **${inviterMember ? inviterMember.displayName : inviter.username}**! 🚀\n\n` +
                        `Your friend <@${member.id}> (\`${member.user.tag}\`) just joined **${guild.name}** using your personal invite link!\n\n` +
                        `📈 **Your Total Invites:** **\`${totalInvites}\`**\n` +
                        (newlyUnlockedRole ? `🎖️ **Congratulations! You unlocked the role:** **${newlyUnlockedRole}**\n` : '') +
                        `A public shout-out has been posted in <#${GENERAL_INTEL_CHANNEL_ID}> honoring your recruitment work!\n\n` +
                        `*Keep sharing to reach the next VIP reward!* 🏆`
                    )
                    .setTimestamp();
                await inviter.send({ embeds: [thankDmEmbed] });
            } catch (dmErr) {
                // Ignore if inviter DMs are closed
            }
        }

        // -------------------------------------------------------------
        // 3. ACTION ROW WITH "INVITE FRIENDS" BUTTON
        // -------------------------------------------------------------
        const inviteRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('generate_user_invite_btn')
                .setLabel('🚀 Invite Friends & Earn Roles')
                .setEmoji('🎁')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setLabel('🌐 Official Website')
                .setStyle(ButtonStyle.Link)
                .setURL('https://www.apexuniverse.online/')
        );

        // -------------------------------------------------------------
        // 4. SEND WELCOME IN #operator-welcome
        // -------------------------------------------------------------
        const welcomeChannel = guild.channels.cache.get(OPERATOR_WELCOME_CHANNEL_ID) || 
                               guild.channels.cache.find(c => c.name.includes('welcome'));
        if (welcomeChannel && welcomeChannel.isTextBased()) {
            const welcomeEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle(`👋 Welcome to ${guild.name}, ${member.displayName}! 🚀`)
                .setDescription(
                    `Welcome <@${member.id}> to the **Apex Universe** warzone network!\n\n` +
                    `### 🪖 Quick Start Steps:\n` +
                    `1. Head to <#${VERIFY_CHANNEL_ID}> to register your Activision Gamertag & unlock squad lobbies.\n` +
                    `2. Check out our official web portal: **[apexuniverse.online](https://www.apexuniverse.online/)**\n` +
                    `3. **Help us grow the community & earn rewards!** Click the button below to generate your unique tracking invite.\n\n` +
                    `🎁 **Invite Rewards Ladder:**\n` +
                    `• **1 Friend:** 🔥 \`Daily Grinder\` Role\n` +
                    `• **5 Friends:** 💎 \`Community Elite\` Role\n` +
                    `• **10 Friends:** ⭐ \`Task Force Director\` & VIP Champion Ranks + Public General Intel Shoutout!`
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setFooter({ text: `Operator #${guild.memberCount}` })
                .setTimestamp();

            await welcomeChannel.send({ content: `<@${member.id}>`, embeds: [welcomeEmbed], components: [inviteRow] }).catch(() => null);
        }

        // -------------------------------------------------------------
        // 5. SEND PERSONALIZED WELCOME DM TO NEW MEMBER
        // -------------------------------------------------------------
        try {
            const memberDmEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle(`🎉 Welcome to Apex Universe, ${member.displayName}! 🚀🔥`)
                .setDescription(
                    `Hey **${member.displayName}**! 🎮\n\n` +
                    `Welcome to **Apex Universe** — the ultimate tactical Warzone & gaming hub!\n\n` +
                    `### 🎯 What to do next:\n` +
                    `1. **Verify your loadout:** Head over to <#${VERIFY_CHANNEL_ID}> in the server.\n` +
                    `2. **Invite Friends & Win Roles:** Click the **"Invite Friends & Earn Roles"** button below to create your personal invite link.\n\n` +
                    `🏆 **Reward Tiers:**\n` +
                    `• **1 Friend Joined:** 🔥 \`Daily Grinder\` Role\n` +
                    `• **5 Friends Joined:** 💎 \`Community Elite\` Role\n` +
                    `• **10 Friends Joined:** ⭐ \`Task Force Director\` VIP Role + Permanent Shoutout in General Intel!\n\n` +
                    `*See you in the lobbies!* 🎧💣`
                )
                .setTimestamp();

            await member.send({ embeds: [memberDmEmbed], components: [inviteRow] });
        } catch (dmErr) {
            // Ignore if DMs are closed
        }

        // -------------------------------------------------------------
        // 6. LOG TO MOD CHANNEL
        // -------------------------------------------------------------
        const accountCreatedTimestamp = Math.floor(member.user.createdTimestamp / 1000);
        const modEmbed = embeds.modAction({
            action: 'Member Joined',
            target: member.user,
            moderator: inviter ? `Invited by ${inviter.tag}` : 'Gateway Event / Direct Link',
            reason: inviter ? `Used invite code: ${usedInviteCode}` : 'Joined via server discovery/direct',
            extra: {
                'Account Created': `<t:${accountCreatedTimestamp}:R>`,
                'Total Members': guild.memberCount,
                'Inviter': inviter ? `<@${inviter.id}> (\`${inviter.tag}\`)` : 'None / Vanilla Link'
            }
        });

        await logModAction(guild, modEmbed);
    }
};
