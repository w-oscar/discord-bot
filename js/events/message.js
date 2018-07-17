const util = require('../util.js')

module.exports = async (message) => {
  if (message.author.bot) return
  util.tryLogToConsole(1, `${message.author.tag} -> ${message.content}`)

  await util.checkTarget(message, message.content)
  .then((guildMember) => message.channel.send(`Target: ${guildMember.user.username}`))
  .catch((e) => message.channel.send(e))
}
