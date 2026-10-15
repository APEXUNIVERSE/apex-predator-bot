const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// Respective Channels in Apex Universe
const OFFICIAL_PATCH_NOTES_CHANNEL_ID = '1539947976942944400'; // #📰・official-patch-notes
const ANNOUNCEMENTS_CHANNEL_ID = '1511460045945176236';        // #📢・universe-announcements
const GENERAL_INTEL_CHANNEL_ID = '1539942530752454686';        // #💬・general-intel

// Simple function to fetch data from URL
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

client.once('ready', async () => {
    console.log(`[DAILY COD INTEL] Logged in as ${client.user.tag}`);

    try {
        const dateStr = new Date().toLocaleDateString('en-US', { 
            timeZone: 'Asia/Kolkata', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });

        // Construct Tactical Intelligence Dossier
        const intelEmbed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle(`📰 CALL OF DUTY: DAILY INTEL & PATCH BRIEFING — ${dateStr}`)
            .setDescription(
                `**Attention @everyone in Apex Universe!**\n\n` +
                `Here is your daily tactical intelligence recap covering the latest official updates, balance changes, and game developments from **[CallofDuty.com](https://www.callofduty.com/)**:\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `### 🎯 WARZONE & BLACK OPS 7 HIGHLIGHTS:\n` +
                `• **Season Meta & Balancing:** Final weapon balance passes across Warzone and BO7 Multiplayer, fine-tuning long-range TTK and handling.\n` +
                `• **Warzone Elimination Multiplier:** Remember that Warzone eliminations award **30 Skulls per kill** towards the limited 100K serialized *Gilded Ruin* camo challenge!\n` +
                `• **RICOCHET Anti-Cheat:** Kernel-level heuristics active across competitive scrims and ranked queues.\n\n` +
                `### 🚀 MODERN WARFARE 4 DEPLOYMENT TRACKER:\n` +
                `• **Launch Countdown:** Modern Warfare 4 officially launches on **October 23, 2026**.\n` +
                `• **Platforms:** Next-gen native on PS5, Xbox Series X|S, PC (Steam, Battle.net), and Nintendo Switch 2.\n` +
                `• **Pre-Order Benefit:** Unlocks the **Hunter Killer Operator Skin** instantly in Warzone/BO7 right now!\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `*Stay locked into our squad comms and check the official patch notes portal below for full weapon stat tables!* 🏆💣`
            )
            .addFields(
                { name: '🌐 Official Blog', value: '[callofduty.com/blog](https://www.callofduty.com/blog)', inline: true },
                { name: '📑 Patch Notes Portal', value: '[callofduty.com/patchnotes](https://www.callofduty.com/patchnotes)', inline: true },
                { name: '🛰️ Apex Universe Hub', value: '[apexuniverse.online](https://www.apexuniverse.online/)', inline: true }
            )
            .setImage('https://imgs.callofduty.com/content/dam/atvi/callofduty/cod-touchui/mw4/common/CODMW4_LOGO_PRIMARY.webp')
            .setFooter({ text: 'Apex Universe • Automated Daily Intelligence System' })
            .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Read Patch Notes')
                .setStyle(ButtonStyle.Link)
                .setURL('https://www.callofduty.com/patchnotes'),
            new ButtonBuilder()
                .setLabel('Official Blog')
                .setStyle(ButtonStyle.Link)
                .setURL('https://www.callofduty.com/blog'),
            new ButtonBuilder()
                .setLabel('Join Squad Comms')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/YPBtDdykS5')
        );

        // Dispatch to respective channels in order of relevance
        const channels = [
            OFFICIAL_PATCH_NOTES_CHANNEL_ID,
            ANNOUNCEMENTS_CHANNEL_ID,
            GENERAL_INTEL_CHANNEL_ID
        ];
        for (const chId of channels) {
            try {
                const ch = await client.channels.fetch(chId).catch(() => null);
                if (ch && ch.isTextBased()) {
                    await ch.send({
                        content: '🚨 @everyone **New Call of Duty Tactical Intel & Patch Notes briefing is live!** 📢⚡',
                        embeds: [intelEmbed],
                        components: [buttons]
                    });
                    console.log(`[SUCCESS] Dispatched daily COD intel to #${ch.name}`);
                }
            } catch (err) {
                console.error(`[ERROR] Failed to send to channel ${chId}:`, err.message);
            }
        }

    } catch (e) {
        console.error('[FATAL] Error in daily COD intel job:', e);
    } finally {
        client.destroy();
        process.exit(0);
    }
});

client.login(process.env.DISCORD_TOKEN);
