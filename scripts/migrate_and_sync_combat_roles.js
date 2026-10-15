require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { COMBAT_ROLE_IDS, COMBAT_ROLES, CHANNELS, GUILD_ID } = require('../src/utils/constants');
const { setUserCombatRole, db } = require('../src/database/db');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', async () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        if (!guild) {
            console.error('❌ Guild not found!');
            process.exit(1);
        }

        console.log(`📍 Connected to Guild: ${guild.name} (${guild.id})`);
        console.log('🔄 Fetching all members...');
        const members = await guild.members.fetch();
        console.log(`👥 Total members fetched: ${members.size}`);

        let savedCount = 0;
        let strippedCount = 0;
        let activeVoiceCount = 0;

        for (const [memberId, member] of members) {
            if (member.user.bot) continue;

            // Check if member currently holds any of the 4 combat roles
            const heldCombatRoles = COMBAT_ROLE_IDS.filter(roleId => member.roles.cache.has(roleId));

            if (heldCombatRoles.length > 0) {
                // Save their first combat role preference into database
                const preferredRole = heldCombatRoles[0];
                setUserCombatRole(guild.id, member.id, preferredRole);
                savedCount++;

                const currentVc = member.voice?.channelId;
                const isInActiveVC = Boolean(currentVc && currentVc !== CHANNELS.AFK_VOICE);

                if (!isInActiveVC) {
                    // Member is NOT currently in an active VC: strip combat roles
                    console.log(`🧹 Stripping combat role(s) from ${member.user.tag} (not in VC)...`);
                    await member.roles.remove(heldCombatRoles, 'Temporary combat role cleanup (not in voice)').catch(err => {
                        console.error(`Error stripping roles from ${member.user.tag}:`, err.message);
                    });
                    strippedCount++;
                } else {
                    console.log(`🎙️ ${member.user.tag} is in active VC (<#${currentVc}>). Keeping ${preferredRole}.`);
                    activeVoiceCount++;
                    // If member had more than 1 combat role, remove the extras
                    if (heldCombatRoles.length > 1) {
                        const extraRoles = heldCombatRoles.slice(1);
                        await member.roles.remove(extraRoles, 'Keep single combat role in VC').catch(() => null);
                    }
                }
            }
        }

        console.log(`\n================ MIGRATION REPORT ================`);
        console.log(`✅ Saved role preferences to DB: ${savedCount} members`);
        console.log(`🧹 Stripped temporary roles (offline/out of VC): ${strippedCount} members`);
        console.log(`🎙️ Active in voice (roles kept): ${activeVoiceCount} members`);
        console.log(`==================================================\n`);

        // Update the embed description in #🏷️・specialty-roles if message exists
        try {
            const specialtyChannel = await guild.channels.fetch(CHANNELS.SPECIALTY_ROLES).catch(() => null);
            if (specialtyChannel && specialtyChannel.isTextBased()) {
                const messages = await specialtyChannel.messages.fetch({ limit: 10 });
                const botMsg = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);
                if (botMsg) {
                    const currentEmbed = botMsg.embeds[0];
                    const updatedDesc = 
                        `### 🎯 Tactical Squad Combat Specializations\n` +
                        `Equip your tactical role within **Apex Universe** fireteams! Each role designates your in-game function during Warzone deployments and ranked operations.\n\n` +
                        `• 🧠 **In-Game Leader (IGL):** Strategic callouts, rotation shot-calling, and macro decisions.\n` +
                        `• 🎯 **Sniper Specialist:** Long-range overwatch, entry picks, and recon information.\n` +
                        `• ⚡ **Entry Fragger:** Front-line breacher, aggressive engagements, and clearing buildings.\n` +
                        `• 🛡️ **Support / Anchor:** Rearguard defense, utility management, suppressive fire, and squad revives.\n\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `> 🎙️ **DYNAMIC VOICE INTEGRATION (Temporary & Game-Based):**\n` +
                        `> Your combat specialization **automatically activates** whenever you join any Squad Voice Channel, and **automatically deactivates** when you disconnect or leave comms.\n` +
                        `> *Zero annoying DM notifications — purely tactical in-game squad coordination.* 🎮⚡`;

                    const { EmbedBuilder } = require('discord.js');
                    const updatedEmbed = EmbedBuilder.from(currentEmbed)
                        .setDescription(updatedDesc)
                        .setFooter({ text: 'Apex Universe • Dynamic Squad Voice Synchronization' });

                    await botMsg.edit({ embeds: [updatedEmbed], components: botMsg.components });
                    console.log('✅ Updated #specialty-roles announcement embed with voice-sync intel.');
                }
            }
        } catch (msgErr) {
            console.error('Error updating specialty-roles message:', msgErr.message);
        }

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.destroy();
        process.exit(0);
    }
});

client.login(process.env.DISCORD_TOKEN);
