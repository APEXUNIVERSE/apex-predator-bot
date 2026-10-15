const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'bot.sqlite'));

// Enable WAL mode for high performance and concurrency
db.pragma('journal_mode = WAL');

// Initialize database tables
db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        mod_log_channel TEXT,
        welcome_channel TEXT,
        welcome_message TEXT DEFAULT 'Welcome to {server}, {user}!',
        welcome_enabled INTEGER DEFAULT 0,
        leave_channel TEXT,
        leave_message TEXT DEFAULT '{user} has left the server.',
        leave_enabled INTEGER DEFAULT 0,
        autorole_id TEXT,
        ticket_category_id TEXT,
        ticket_transcript_channel TEXT,
        automod_anti_spam INTEGER DEFAULT 0,
        automod_anti_invites INTEGER DEFAULT 0,
        automod_anti_links INTEGER DEFAULT 0,
        automod_anti_mass_mention INTEGER DEFAULT 0,
        automod_bad_words TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS warnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at INTEGER NOT NULL,
        closed_at INTEGER,
        closed_by TEXT
    );

    CREATE TABLE IF NOT EXISTS reaction_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message_id TEXT NOT NULL,
        role_id TEXT NOT NULL,
        emoji TEXT,
        label TEXT
    );

    CREATE TABLE IF NOT EXISTS member_invites (
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        invites_count INTEGER DEFAULT 0,
        PRIMARY KEY (guild_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS invited_members (
        guild_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        inviter_id TEXT NOT NULL,
        joined_at INTEGER NOT NULL,
        PRIMARY KEY (guild_id, member_id)
    );

    CREATE TABLE IF NOT EXISTS user_combat_roles (
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role_id TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (guild_id, user_id)
    );
`);


function getGuildSettings(guildId) {
    const stmt = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?');
    let settings = stmt.get(guildId);
    if (!settings) {
        const insert = db.prepare(`
            INSERT INTO guild_settings (guild_id) VALUES (?)
        `);
        insert.run(guildId);
        settings = stmt.get(guildId);
    }
    return settings;
}

function updateGuildSetting(guildId, column, value) {
    getGuildSettings(guildId);
    const stmt = db.prepare(`UPDATE guild_settings SET ${column} = ? WHERE guild_id = ?`);
    return stmt.run(value, guildId);
}

function addWarning(guildId, userId, moderatorId, reason) {
    const stmt = db.prepare(`
        INSERT INTO warnings (guild_id, user_id, moderator_id, reason, timestamp)
        VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(guildId, userId, moderatorId, reason, Date.now());
}

function getWarnings(guildId, userId) {
    const stmt = db.prepare(`
        SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC
    `);
    return stmt.all(guildId, userId);
}

function deleteWarning(guildId, warningId) {
    const stmt = db.prepare(`
        DELETE FROM warnings WHERE guild_id = ? AND id = ?
    `);
    return stmt.run(guildId, warningId);
}

function clearWarnings(guildId, userId) {
    const stmt = db.prepare(`
        DELETE FROM warnings WHERE guild_id = ? AND user_id = ?
    `);
    return stmt.run(guildId, userId);
}

function createTicket(guildId, channelId, userId) {
    const stmt = db.prepare(`
        INSERT INTO tickets (guild_id, channel_id, user_id, status, created_at)
        VALUES (?, ?, ?, 'open', ?)
    `);
    return stmt.run(guildId, channelId, userId, Date.now());
}

function getTicketByChannel(channelId) {
    const stmt = db.prepare('SELECT * FROM tickets WHERE channel_id = ?');
    return stmt.get(channelId);
}

function closeTicket(channelId, closedBy) {
    const stmt = db.prepare(`
        UPDATE tickets 
        SET status = 'closed', closed_at = ?, closed_by = ? 
        WHERE channel_id = ?
    `);
    return stmt.run(Date.now(), closedBy, channelId);
}

function addReactionRole(guildId, channelId, messageId, roleId, emoji, label) {
    const stmt = db.prepare(`
        INSERT INTO reaction_roles (guild_id, channel_id, message_id, role_id, emoji, label)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(guildId, channelId, messageId, roleId, emoji, label);
}

function getReactionRole(messageId, roleId) {
    const stmt = db.prepare('SELECT * FROM reaction_roles WHERE message_id = ? AND role_id = ?');
    return stmt.get(messageId, roleId);
}

function getInvites(guildId, userId) {
    const stmt = db.prepare('SELECT invites_count FROM member_invites WHERE guild_id = ? AND user_id = ?');
    const row = stmt.get(guildId, userId);
    return row ? row.invites_count : 0;
}

function incrementInvite(guildId, inviterId, memberId) {
    // Record relationship
    const stmtRel = db.prepare(`
        INSERT OR REPLACE INTO invited_members (guild_id, member_id, inviter_id, joined_at)
        VALUES (?, ?, ?, ?)
    `);
    stmtRel.run(guildId, memberId, inviterId, Date.now());

    // Increment or initialize count
    const stmtInc = db.prepare(`
        INSERT INTO member_invites (guild_id, user_id, invites_count)
        VALUES (?, ?, 1)
        ON CONFLICT(guild_id, user_id) DO UPDATE SET invites_count = invites_count + 1
    `);
    stmtInc.run(guildId, inviterId);

    return getInvites(guildId, inviterId);
}

function getTopInviters(guildId, limit = 10) {
    const stmt = db.prepare(`
        SELECT user_id, invites_count 
        FROM member_invites 
        WHERE guild_id = ? AND invites_count > 0 
        ORDER BY invites_count DESC 
        LIMIT ?
    `);
    return stmt.all(guildId, limit);
}

function setUserCombatRole(guildId, userId, roleId) {
    const stmt = db.prepare(`
        INSERT INTO user_combat_roles (guild_id, user_id, role_id, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(guild_id, user_id) DO UPDATE SET role_id = excluded.role_id, updated_at = excluded.updated_at
    `);
    return stmt.run(guildId, userId, roleId, Date.now());
}

function getUserCombatRole(guildId, userId) {
    const stmt = db.prepare('SELECT role_id FROM user_combat_roles WHERE guild_id = ? AND user_id = ?');
    const row = stmt.get(guildId, userId);
    return row ? row.role_id : null;
}

module.exports = {
    db,
    getGuildSettings,
    updateGuildSetting,
    addWarning,
    getWarnings,
    deleteWarning,
    clearWarnings,
    createTicket,
    getTicketByChannel,
    closeTicket,
    addReactionRole,
    getReactionRole,
    getInvites,
    incrementInvite,
    getTopInviters,
    setUserCombatRole,
    getUserCombatRole
};

