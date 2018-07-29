const util = require('../util.js')

module.exports = {
  command: {
    description: 'User Info for yourself / a target',
    usage: 'userinfo [target]',
    aliases: ['info', 'userinfo', 'ui'],
    group: 'util',

    botAccess: [],
    userAccess: ['MANAGE_MESSAGES'],
    channelType: ['text'],

    execute: async (message, args) => {
      let target = message.author
      try {
        if (args[0]) target = await util.checkTarget(message, args[0])

        util.successReply(message, '', `**User Info**\n\n**User:** ${target} (${target.tag}) [${target.id}]`)
      } catch (e) {
        util.errorReply(message, '', e)
      }
    }
  }
}
