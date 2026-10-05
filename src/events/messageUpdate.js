const embeds = require('../utils/embeds');
const { logModAction } = require('../utils/modLogger');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (!newMessage.guild || newMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return; // ignore embed expansions or pins

        const modEmbed = embeds.modAction({
            action: 'Message Edited',
            target: newMessage.author,
            moderator: 'Message System',
            reason: `Edited in #${newMessage.channel.name}`,
            extra: {
                'Channel': `<#${newMessage.channel.id}>`,
                'Jump Link': `[Click Here](${newMessage.url})`,
                'Before': oldMessage.content ? `\`\`\`${oldMessage.content.slice(0, 300)}\`\`\`` : '*Unknown*',
                'After': newMessage.content ? `\`\`\`${newMessage.content.slice(0, 300)}\`\`\`` : '*Unknown*'
            }
        });

        await logModAction(newMessage.guild, modEmbed);
    }
};
