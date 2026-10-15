const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    AttachmentBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

const imagePath = 'C:/Users/aaram/.gemini/antigravity/brain/b80e97a2-21e9-4e97-87d3-50310ebdf481/.user_uploaded/media_1792033578583_39fa0254.webp';
const USER_ID = '556305329097277463'; // Snipe Dogg / indiansniper_

client.once('ready', async () => {
    console.log('Logged in as ' + client.user.tag);

    // Interactive Action Row
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Official MW4 Blog & Intel')
            .setStyle(ButtonStyle.Link)
            .setURL('https://www.callofduty.com/blog/2026/05/call-of-duty-modern-warfare-4-preorder-benefits-game-editions-details'),
        new ButtonBuilder()
            .setLabel('Apex Universe Portal')
            .setStyle(ButtonStyle.Link)
            .setURL('https://www.apexuniverse.online/'),
        new ButtonBuilder()
            .setLabel('Warzone Squads Hub')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/YPBtDdykS5')
    );

    // Channels in APEX UNIVERSE ONLY
    const channelsToPost = [
        '1511460045945176236', // #📢・universe-announcements (Apex Universe)
        '1539942530752454686'  // #💬・general-intel (Apex Universe)
    ];

    const announcementEmbed = new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle('🚨 TACTICAL INTEL DROP: CALL OF DUTY: MODERN WARFARE 4 & WARZONE 🚨')
        .setDescription(
            '**Attention Operators, Pilots, and Apex Universe Squad Members!**\n\n' +
            'Activision and Infinity Ward have revealed major tactical briefings for **Call of Duty: Modern Warfare 4 (MW4)** launching **October 23, 2026**, along with game-changing updates for **Warzone**! Here is your complete mission dossier:\n\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '### 📅 LAUNCH & PLATFORM INTEL:\n' +
            '• **Worldwide Launch Date:** **October 23, 2026**\n' +
            '• **Next-Gen Pure:** Available on **PS5, Xbox Series X|S, PC (Steam, Battle.net, Xbox PC)**, and **Nintendo Switch 2**.\n' +
            '• ⚠️ *No last-gen release (PS4/Xbox One excluded) & not on Game Pass at launch for maximum next-gen engine performance.*\n\n' +
            '### 🪖 INSTANT WARZONE & BLACK OPS 7 BENEFITS:\n' +
            '• **Hunter Killer Operator Skin:** Pre-ordering any digital edition instantly unlocks the lethal *Hunter Killer* operator skin in **Warzone** and **Black Ops 7** right now, plus full carry-forward into MW4 on launch day!\n' +
            '• **Open Beta Early Access:** Secure early deployment access into the MW4 Multiplayer Open Beta before anyone else.\n\n' +
            '### 💀 WARZONE SERIALIZED CAMO HUNT (LIMITED 100K):\n' +
            '• Earn **5,000 Skulls** across modes to unlock the **Gilded Ruin** Universal Weapon Camo.\n' +
            '• 🔥 **Warzone Bonus:** Warzone eliminations award **30 Skulls per kill** (highest in the game!).\n' +
            '• 🎖️ The first 100,000 players globally receive a **permanently engraved serialized number (1–100,000)** on their camo that carries forward into MW4!\n\n' +
            '### 💎 VAULT EDITION LOADOUT:\n' +
            '• **Hostile Alliance Pack:** Price, Ghost, Valeria, and Blix Operators.\n' +
            '• **Special Forces Pack:** Tier-1 operatives from UK SAS, France COM SFT, Germany KSK, and South Korea.\n' +
            '• **Signature Weapon Collection:** 5 weapon blueprints with high-tech **Apex Attachments** (RF Pulse EMP barrel, RFID tracker optic, explosive 12G slugs, and receiver-mounted throwing knives).\n' +
            '• **BlackCell Season 1:** Full Battle Pass + 20 Tier Skips + 1,100 COD Points.\n' +
            '• **DMZ Deployment Bonus:** Exclusive DMZ loadouts and gear.\n' +
            '• **10% Loyalty Discount:** Available for returning COD players on digital storefronts!\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '*Check out the official briefing, assemble your squads in Apex Universe, and prepare for deployment!* 🏆🎯'
        )
        .setImage('attachment://CODMW4_LOGO_PRIMARY.webp')
        .setFooter({ text: 'Apex Universe • Tactical Operations & Esports Community Intel' })
        .setTimestamp();

    // 1. Post to Server Channels (Apex Universe only)
    for (const chId of channelsToPost) {
        try {
            const ch = await client.channels.fetch(chId).catch(() => null);
            if (ch && ch.isTextBased()) {
                await ch.send({
                    embeds: [announcementEmbed],
                    files: [new AttachmentBuilder(imagePath, { name: 'CODMW4_LOGO_PRIMARY.webp' })],
                    components: [row]
                });
                console.log('✅ Posted MW4 briefing to channel: #' + ch.name + ' (' + ch.guild.name + ')');
            }
        } catch (e) {
            console.error('Error posting to channel ' + chId + ':', e.message);
        }
    }

    // 2. Fetch Apex Universe Guild Members Only
    console.log('\n--- Starting Personalized Member DMs (Apex Universe Only) ---');
    const guild = client.guilds.cache.get('1511457449360752690'); // Apex Universe
    if (!guild) {
        console.error('Apex Universe Guild not found');
        process.exit(1);
    }

    const members = await guild.members.fetch();
    const humanMembers = members.filter(m => !m.user.bot);
    console.log(`Found ${humanMembers.size} human members in Apex Universe.`);

    let successCount = 0;
    let failedCount = 0;

    for (const [id, member] of humanMembers) {
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xF1C40F)
                .setTitle('🚨 UPCOMING CALL OF DUTY: MW4 & WARZONE INTEL BRIEFING')
                .setDescription(
                    `Hey **${member.displayName}**, 👋\n\n` +
                    `Here is your official tactical intelligence briefing on **Call of Duty: Modern Warfare 4** and upcoming **Warzone** features for the **Apex Universe** squad!\n\n` +
                    `### 🎯 QUICK MISSION SUMMARY:\n` +
                    `• 📅 **MW4 Launch:** **October 23, 2026** (Next-Gen Pure: PS5, Xbox Series X|S, PC, Switch 2)\n` +
                    `• 🎁 **Instant Warzone Skin:** Pre-order grants the **Hunter Killer** skin immediately in Warzone & BO7.\n` +
                    `• 💀 **Warzone Serialized Camo Hunt:** 5,000 Skulls challenge — Warzone kills award **30 skulls each**! The first 100,000 players globally get unique numbered engravings (1–100,000) on their camo.\n` +
                    `• 💎 **Vault Edition:** Hostile Alliance Operators (Price, Ghost, Valeria, Blix), Special Forces, Signature Weapons with Apex attachments (EMP barrel, RFID tracker optic), DMZ bonus, & Season 1 BlackCell!\n` +
                    `• 🏷️ **10% Loyalty Discount:** For players owning past COD titles.\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `Check the full briefing below and lock in your squad in our Discord lobbies! 🏆💣`
                )
                .setImage('attachment://CODMW4_LOGO_PRIMARY.webp')
                .setFooter({ text: 'Apex Universe • Tactical Operations & Community Network' })
                .setTimestamp();

            await member.send({
                embeds: [dmEmbed],
                files: [new AttachmentBuilder(imagePath, { name: 'CODMW4_LOGO_PRIMARY.webp' })],
                components: [row]
            });

            successCount++;
            console.log(`[${successCount}/${humanMembers.size}] ✅ DM delivered to: ${member.displayName} (${member.user.username})`);

            // Sleep 850ms to respect Discord rate limits
            await new Promise(r => setTimeout(r, 850));
        } catch (err) {
            failedCount++;
            console.log(`⚠️ DM skipped for ${member.displayName} (DMs closed/private): ${err.message}`);
        }
    }

    // 3. Make sure to send directly to you as well
    try {
        const directUser = await client.users.fetch(USER_ID).catch(() => null);
        if (directUser) {
            const userEmbed = new EmbedBuilder()
                .setColor(0xF1C40F)
                .setTitle('🚨 CALL OF DUTY: MW4 & WARZONE INTEL BRIEFING (CONFIRMATION COPY)')
                .setDescription(
                    `Hey **${directUser.username}** (Ram / Snipe Dogg), 👋\n\n` +
                    `Here is your personal copy of the **Call of Duty: Modern Warfare 4 & Warzone** broadcast that has been dispatched across **Apex Universe**!\n\n` +
                    `### 🎯 MISSION INTEL OVERVIEW:\n` +
                    `• 📅 **MW4 Launch:** **October 23, 2026** (Next-Gen Pure: PS5, Xbox Series X|S, PC, Switch 2)\n` +
                    `• 🎁 **Instant Warzone Skin:** Pre-order grants the **Hunter Killer** skin immediately in Warzone & BO7.\n` +
                    `• 💀 **Warzone Serialized Camo Hunt:** 5,000 Skulls challenge — Warzone kills give **30 skulls each**! Unique serial numbers 1–100,000 for top grinders.\n` +
                    `• 💎 **Vault Edition:** Hostile Alliance Operators (Price, Ghost, Valeria, Blix), Special Forces, Signature Weapons with Apex attachments (EMP barrel, RFID tracker optic), DMZ bonus, & Season 1 BlackCell!\n` +
                    `• 🏷️ **10% Loyalty Discount:** Available for returning COD operators.\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `All members in Apex Universe have received their personalized briefing!`
                )
                .setImage('attachment://CODMW4_LOGO_PRIMARY.webp')
                .setFooter({ text: 'Apex Universe • Tactical Operations & Esports Community' })
                .setTimestamp();

            await directUser.send({
                embeds: [userEmbed],
                files: [new AttachmentBuilder(imagePath, { name: 'CODMW4_LOGO_PRIMARY.webp' })],
                components: [row]
            });
            console.log('✅ Direct copy delivered to user (' + directUser.tag + ')');
        }
    } catch (directErr) {
        console.error('Error sending direct copy to user:', directErr.message);
    }

    console.log('\n======================================');
    console.log('Apex Universe MW4 Broadcast Complete!');
    console.log('Delivered DMs: ' + successCount);
    console.log('Skipped (DMs Closed): ' + failedCount);
    console.log('======================================');

    client.destroy();
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
