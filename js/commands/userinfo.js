const util = require('../util.js')

module.exports = {
  command: {
    description: 'User Info for yourself / a target',
    usage: 'userinfo [target] {flags}',
    aliases: ['info', 'userinfo', 'ui'],
    group: 'util',
    flags: { '-g': 'Try global cache rather than guild specific' },

    botAccess: [],
    userAccess: ['MANAGE_MESSAGES'],
    channelType: ['text', 'dm'],

    execute: async (message, args, flags) => {
      let target = message.author
      try {
        if (args[0]) target = await util.checkTarget(message, args[0], flags.includes('-g'))

        util.successReply(message, '', `${util.translateMessage('en', 'userInfoHeader')}\n\n${util.translateMessage('en', 'userInfoUser')} ${target} (${target.tag}) [${target.id}]`)
      } catch (e) {
        util.errorReply(message, '', e)
      }
    }
  }
}
