# 🛡️ Discord Server Management Bot

A production-grade, feature-packed Discord Server Management and Moderation Bot built with **Discord.js v14** and **SQLite**.

---

## 🚀 Key Features

### 🔨 1. Moderation Suite
- `/ban <target> [reason] [delete_days]` — Ban member and purge up to 7 days of message history.
- `/unban <user_id> [reason]` — Unban a user by their User ID.
- `/kick <target> [reason]` — Kick a member with DM notification.
- `/timeout <target> <duration> <unit> [reason]` — Mute/Timeout a member (Minutes, Hours, Days).
- `/untimeout <target> [reason]` — Lift active timeout.
- `/warn <target> <reason>` — Issue formal warning, persist in SQLite, and notify member in DM.
- `/warnings <target>` — View warnings history for any user.
- `/delwarn <warn_id>` — Delete a specific warning.
- `/clearwarns <target>` — Clear all warnings for a user.
- `/purge <amount> [target] [filter]` — Bulk purge messages with filters (Bots only, Humans only, Links, Attachments).
- `/lock [channel] [reason]` — Lockdown channel.
- `/unlock [channel]` — Re-enable channel messages for members.
- `/slowmode <seconds> [channel]` — Set channel slowmode rate limit.
- `/nick <target> [nickname]` — Change or reset a member's nickname.

---

### ⚙️ 2. Administration & Configuration
- `/setlogs [channel]` — Set central audit log channel for moderation, message edits/deletes, member joins/leaves.
- `/setwelcome <enabled> [channel] [message]` — Configurable welcome greeting with variables `{user}`, `{server}`, `{memberCount}`.
- `/setleave <enabled> [channel] [message]` — Configurable farewell message.
- `/setautorole [role]` — Automatically assign role to newcomers.
- `/automod status / antispam / antiinvites / antilinks / antimention / badwords` — Configure automated protection filters.
- `/ticket-setup <channel> <category> [title] [description]` — Interactive support ticket system with buttons and private channels.
- `/reactionrole <channel> <role> <button_label> [description] [emoji]` — Self-assignable button role menu.

---

### 📊 3. Utility & Server Statistics
- `/serverinfo` — Server stats, member counts (humans vs bots), boost status, channels, verification level.
- `/userinfo [target]` — User avatar, creation date, join date, server roles.
- `/botinfo` — Bot latency, memory consumption, uptime, guild count, Discord.js & Node versions.
- `/ping` — Roundtrip response time and WebSocket heartbeat.
- `/help` — Interactive command catalog with category selector.

---

## 🛠️ Setup & Running

### 1. Requirements
- **Node.js**: v18.0.0 or higher (v24 recommended)
- **Discord Bot Token** with Privileged Gateway Intents enabled:
  - `Server Members Intent`
  - `Message Content Intent`

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Your `.env` file contains:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id
```

### 4. Start the Bot
```bash
# Production mode
npm start

# Development mode (with auto-reload on file changes)
npm run dev
```

---

## 🔐 Permissions Required by the Bot
When inviting the bot to your Discord server, make sure to grant the following permissions:
- **Administrator** (or: `Manage Server`, `Manage Roles`, `Manage Channels`, `Kick Members`, `Ban Members`, `Moderate Members`, `Manage Messages`, `Send Messages`, `Embed Links`, `Attach Files`, `Read Message History`, `Add Reactions`).

> [!TIP]
> Ensure the Bot's role in Server Settings -> Roles is placed **above** the roles you want it to assign or moderate.
