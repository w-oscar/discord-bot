const config = require('../../config.json')

const index = require('../../index.js')
const data = require('../data.js')
const util = require('../util.js')

module.exports = async (message) => {
  if (message.author.bot) return
  checkCommand(message)

  util.tryLogToConsole(1, `${message.author.tag} -> ${message.content}`)

  /* await util.checkTarget(message, message.content)
  .then((guildMember) => message.channel.send(`Target: ${guildMember.user.username}`))
  .catch((e) => message.channel.send(e))
  */
}

function checkCommand (message) {
  var args
  var lowercaseContent = message.content.toLowerCase()

  if (lowercaseContent.length < 1) return

  if (message.channel.type === 'text') {
    // if (!data.data.guilds[message.guild.id]) return

    if (lowercaseContent.startsWith(config.guild.defaultPrefix)) {
      // if (!data.data.guilds[message.guild.id].ready) return

      args = message.content.split(/\s+/g)
      args[0] = args[0].slice(config.guild.defaultPrefix.length)
    } else if (lowercaseContent.replace('!', '').startsWith(`<@${index.client.user.id}>`)) {
      // if (!data.data.guilds[message.guild.id].ready) return

      args = message.content.split(/\s+/g).slice(1)
    }
  } else {
    args = message.content.replace(config.guild.defaultPrefix, '').split(/\s+/g)
  }

  if (!args) return

  let checkArgs = args.join(' ').toLowerCase()

  for (let command of data.commands) {
    for (let i = 0; i < command.command.aliases.length; i++) {
      if (checkArgs.startsWith(command.command.aliases[i])) {
        if (!command.command.channelType.includes(message.channel.type)) {
          // util.errorReply(message.channel, `You cannot use this command here.`); break
        }

        if (message.channel.type === 'text') {
          if (!message.guild.member(index.client.user).permissionsIn(message.channel).has(command.command.botAccess)) {
            break
            // util.errorReply(message.channel, `The Bot doesn't have some/all of the following Permissions \`${command.command.botAccess}\` in this Channel.`, data.data.guilds[message.guild.id].deletetime); break
          }

          if (!message.member.permissionsIn(message.channel).has(command.command.userAccess) && !message.member.permissions.has(command.command.userAccess) && !config.bot.owner.includes(message.author.id)) {
            break
            // util.errorReply(message.channel, `You don't have some/all of the following Permissions \`${command.command.userAccess}\` in this Channel.`, data.data.guilds[message.guild.id].deletetime); break
          }
        }

        command.command.execute(message, args.splice(command.command.aliases[i].split(/\s+/g).length, args.length - 1))
      }
    }
  }
}
