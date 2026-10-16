require('dotenv').config({ path: 'C:/Users/aaram/DISCORD/DICORD APEX/.env' });
const { 
    Client, 
    GatewayIntentBits, 
    GuildScheduledEventPrivacyLevel, 
    GuildScheduledEventEntityType,
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    AttachmentBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildScheduledEvents
    ]
});

const GUILD_ID = '1511457449360752690';
const EVENTS_HUB_CHANNEL_ID = '1539942627137429548'; // 📅・events-hub
const STREAM_ALERTS_CHANNEL_ID = '1539942641322692619'; // 🔴・stream-alerts
const YOUTUBE_STREAM_URL = 'https://www.youtube.com/@SNIPE-DOGG/live';
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@SNIPE-DOGG';

// Image paths
const LOCAL_IMAGE_PATH = 'C:/Users/aaram/.gemini/antigravity/brain/b80e97a2-21e9-4e97-87d3-50310ebdf481/.user_uploaded/media_1792175144287_d2dbdbab.png';
const MW4_CDN_BANNER = 'https://imgs.callofduty.com/content/dam/atvi/callofduty/cod-touchui/mw4/common/CODMW4_LOGO_PRIMARY_RGB_NEG.png';

client.once('ready', async () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        if (!guild) {
            console.error('❌ Guild not found!');
            process.exit(1);
        }
        console.log(`📍 Connected to Guild: ${guild.name}`);

        // Read image for event banner
        let imageBuffer = null;
        if (fs.existsSync(LOCAL_IMAGE_PATH)) {
            imageBuffer = fs.readFileSync(LOCAL_IMAGE_PATH);
            console.log(`🖼️ Loaded local event banner (${imageBuffer.length} bytes)`);
        }

        // Schedule Start: 1 hour from now; End: 4 hours from now
        const startTime = new Date(Date.now() + 60 * 60 * 1000);
        const endTime = new Date(Date.now() + 4 * 60 * 60 * 1000);

        console.log(`⏰ Creating Scheduled Event starting at ${startTime.toISOString()}...`);

        // Create Official Discord Scheduled Event
        const scheduledEvent = await guild.scheduledEvents.create({
            name: 'Modern Warfare 4: Early Campaign Access Live Stream',
            scheduledStartTime: startTime,
            scheduledEndTime: endTime,
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: {
                location: YOUTUBE_STREAM_URL
            },
            description: 
                `🔥 OPERATORS ASSEMBLE! Call of Duty: Modern Warfare 4 Early Campaign Access is here!\n\n` +
                `We will be streaming the full campaign playthrough live on YouTube shortly. Experience next-gen tactical gameplay, intense firefights, and story missions live with the Apex Universe squad!\n\n` +
                `🔴 Stream Link: ${YOUTUBE_STREAM_URL}\n` +
                `🔔 IMPORTANT: Make sure to Subscribe and click the Bell icon (ALL NOTIFICATIONS) on YouTube so you get instantly notified when the stream goes live!`,
            image: imageBuffer ? `data:image/png;base64,${imageBuffer.toString('base64')}` : undefined,
            reason: 'Modern Warfare 4 Early Campaign Access Stream Launch'
        });

        console.log(`✅ Scheduled Event Created Successfully! ID: ${scheduledEvent.id}`);
        console.log(`🔗 Event URL: ${scheduledEvent.url}`);

        // Build Rich Announcement Embed for Discord Channels
        const eventEmbed = new EmbedBuilder()
            .setColor(0xED4245) // Call of Duty Crimson Red
            .setTitle('🚨 EVENT ALERT: Modern Warfare 4 Early Campaign Access Live Stream!')
            .setURL(scheduledEvent.url)
            .setDescription(
                `### 🎮 Modern Warfare 4 Campaign Early Access Is Dropping!\n\n` +
                `Operators, get ready! We are hosting a scheduled live stream for the exclusive **Call of Duty: Modern Warfare 4 Early Campaign Access** shortly on YouTube!\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `### 🔴 Stream Coordinates:\n` +
                `• 📺 **Platform:** YouTube Live\n` +
                `• 🔗 **Direct Stream URL:** [youtube.com/@SNIPE-DOGG/live](${YOUTUBE_STREAM_URL})\n` +
                `• 📅 **Discord Event:** [Click here to mark Interested on Discord](${scheduledEvent.url})\n\n` +
                `### 🔔 Critical Action Required:\n` +
                `👉 **Subscribe to the channel** and **hit the Notification Bell (🔔 ALL)** right now so you receive an instant push notification the second the stream kicks off!\n\n` +
                `*Lock and load. Don't miss the first mission deployment!* 🎖️💥`
            )
            .addFields(
                { name: '🎯 Stream Focus', value: 'Modern Warfare 4 Full Early Campaign Walkthrough & Tactical Combat', inline: false },
                { name: '⏰ Status', value: '🔴 **Streaming on YouTube shortly** — Subscribe & ring the bell!', inline: false }
            )
            .setImage('attachment://mw4_logo.png')
            .setFooter({ 
                text: 'APEX UNIVERSE • Official Stream Event', 
                iconURL: guild.iconURL() || undefined 
            })
            .setTimestamp();

        // Action Buttons: YouTube Link + Discord Event Link
        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('🔴 Watch Stream on YouTube')
                .setStyle(ButtonStyle.Link)
                .setURL(YOUTUBE_STREAM_URL)
                .setEmoji('📺'),
            new ButtonBuilder()
                .setLabel('🔔 Subscribe & Ring Bell')
                .setStyle(ButtonStyle.Link)
                .setURL(YOUTUBE_CHANNEL_URL)
                .setEmoji('🔔'),
            new ButtonBuilder()
                .setLabel('📅 View Discord Event')
                .setStyle(ButtonStyle.Link)
                .setURL(scheduledEvent.url)
                .setEmoji('🎟️')
        );

        const attachment = new AttachmentBuilder(LOCAL_IMAGE_PATH, { name: 'mw4_logo.png' });

        // Dispatch Announcement to 📅・events-hub
        const eventsChannel = await guild.channels.fetch(EVENTS_HUB_CHANNEL_ID).catch(() => null);
        if (eventsChannel && eventsChannel.isTextBased()) {
            await eventsChannel.send({
                content: '@everyone 🚨 **NEW EVENT ANNOUNCEMENT: Modern Warfare 4 Early Campaign Access Stream!**',
                embeds: [eventEmbed],
                components: [actionRow],
                files: [attachment]
            });
            console.log(`📢 Announcement dispatched to #${eventsChannel.name} (${eventsChannel.id})`);
        }

        // Dispatch Announcement to 🔴・stream-alerts
        const streamChannel = await guild.channels.fetch(STREAM_ALERTS_CHANNEL_ID).catch(() => null);
        if (streamChannel && streamChannel.isTextBased()) {
            await streamChannel.send({
                content: '@everyone 🎬 **Modern Warfare 4 Early Campaign Access is coming to YouTube shortly!**',
                embeds: [eventEmbed],
                components: [actionRow],
                files: [new AttachmentBuilder(LOCAL_IMAGE_PATH, { name: 'mw4_logo.png' })]
            });
            console.log(`📢 Announcement dispatched to #${streamChannel.name} (${streamChannel.id})`);
        }

        console.log('🎉 All events and announcements dispatched successfully!');

    } catch (error) {
        console.error('❌ Error creating event/announcement:', error);
    } finally {
        client.destroy();
        process.exit(0);
    }
});

client.login(process.env.DISCORD_TOKEN);
