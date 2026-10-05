const embeds = require('../utils/embeds');
const { logModAction } = require('../utils/modLogger');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        if (!message.guild || message.author?.bot) return;

        const attachments = message.attachments.size > 0 
            ? message.attachments.map(a => `[${a.name}](${a.url})`).join(', ') 
            : null;

        const modEmbed = embeds.modAction({
            action: 'Message Deleted',
            target: message.author || 'Unknown User',
            moderator: 'Message System',
            reason: 'Message was deleted',
            extra: {
                'Channel': `<#${message.channel.id}>`,
                'Content': message.content ? `\`\`\`${message.content.slice(0, 500)}\`\`\`` : '*No text content*',
                ...(attachments ? { 'Attachments': attachments } : {})
            }
        });

        await logModAction(message.guild, modEmbed);
    }
};
