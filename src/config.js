require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID || '1539928402209935430',
    colors: {
        primary: parseInt(process.env.EMBED_COLOR ? process.env.EMBED_COLOR.replace('#', '') : '5865F2', 16),
        success: parseInt(process.env.SUCCESS_COLOR ? process.env.SUCCESS_COLOR.replace('#', '') : '57F287', 16),
        error: parseInt(process.env.ERROR_COLOR ? process.env.ERROR_COLOR.replace('#', '') : 'ED4245', 16),
        warning: parseInt(process.env.WARNING_COLOR ? process.env.WARNING_COLOR.replace('#', '') : 'FEE75C', 16),
        info: 0x3498DB,
        mod: 0xE67E22
    },
    emojis: {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        mod: '🛡️',
        ticket: '🎫',
        lock: '🔒',
        unlock: '🔓',
        user: '👤',
        channel: '📁',
        role: '🏷️'
    }
};
