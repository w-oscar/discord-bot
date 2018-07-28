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
      let target = message.member
      try {
        if (args[0]) target = await util.checkTarget(message, args[0])

        util.successReply(message, '', `Found: ${target.user.username}`)
      } catch (e) {
        util.errorReply(message, '', e)
      }
    }
  }
}
