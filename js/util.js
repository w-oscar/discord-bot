const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')

const config = require('../config.json')

const data = require('./data.js')
const index = require('../index.js')

function start () {
  loadCommands('js/commands')

  index.client.login(config.bot.token)
}

function loadCommands (string) {
  return new Promise(async (resolve, reject) => {
    try {
      let files = await new Promise((resolve, reject) => fs.readdir(string, (error, files) => error ? reject(error) : resolve(files)))

      for (let i in files) {
        let fileStat = await new Promise((resolve, reject) => fs.lstat(path.resolve(string, files[i]), (error, stats) => error ? reject(error) : resolve(stats)))

        if (fileStat.isDirectory()) {
          await loadCommands(path.resolve(string, files[i]))
        } else {
          data.commands.push(require(path.resolve(string, files[i])))
        }
      }

      resolve()
    } catch (error) {
      console.log(error)
    }
  })
}

function tryLogToConsole (type, value) {
  if (data.consoleLog) {
    switch (type) {
      case 0:
        console.log(`[eventLoader] ${value}`); break
      case 1:
        console.log(`[message] ${value}`)
    }
  }
}

function checkTarget (message, phrase) {
  return new Promise(async (resolve, reject) => {
    if (phrase.startsWith('<@')) {
      phrase = phrase.replace('!', '')
      phrase = phrase.slice(2).slice(0, -1)
    }

    if (!isNaN(phrase)) {
      try {
        return resolve(await index.client.fetchUser(phrase))
      } catch (e) { console.log(e) }
    }

    if (message.guild) {
      try {
        let guildMembers = message.guild.members

        if (message.guild.large) guildMembers = await message.guild.fetchMembers
        let members = guildMembers.filter((guildMember) => guildMember.displayName.toLowerCase().includes(phrase.toLowerCase())).array()

        if (members.length > 1) {
          let sendMessage = `\`\`\``

          for (let i = 0; i < members.length || i > 6; i++) {
            sendMessage += `\n${i} | ${members[i].displayName} (${members[i].user.tag}) [${members[i].id}]`
          }

          if (members.length > 6) sendMessage += `\n${members.length - 6} more...`

          sendMessage += `\`\`\``
          await successReply(message, sendMessage, translateMessage('en', 'findTargetMultiple'))

          let caughtMessages = await message.channel.awaitMessages((m) => m.author === message.author, { maxMatches: 1, time: 15000, errors: ['time'] })
          let caughtMessage = caughtMessages.array()
          let c = caughtMessage[0].content

          if (isNaN(c)) return reject(translateMessage('en', 'findTargetInvalidResponse'))

          let int = parseInt(c)
          if (int > members.length - 1 || int < 0) return reject(translateMessage('en', 'findTargetInvalidResponse'))

          return resolve(members[int].user)
        } else {
          if (members.length === 0) return reject(translateMessage('en', 'findTargetNoneFound'))
          return resolve(members[0].user)
        }
      } catch (e) { console.log(e) }
    } else {
      try {
        let users = index.client.users.filter((user) => user.username.toLowerCase().includes(phrase.toLowerCase())).array()

        if (users.length > 1) {
          let sendMessage = `\`\`\``

          for (let i = 0; i < users.length || i > 6; i++) {
            sendMessage += `\n${i} | ${users[i].username} (${users[i].tag}) [${users[i].id}]`
          }

          if (users.length > 6) sendMessage += `\n${users.length - 6} more...`

          sendMessage += `\`\`\``
          await successReply(message, sendMessage, translateMessage('en', 'findTargetMultiple'))

          let caughtMessages = await message.channel.awaitMessages((m) => m.author === message.author, { maxMatches: 1, time: 15000, errors: ['time'] })
          let caughtMessage = caughtMessages.array()
          let c = caughtMessage[0].content

          if (isNaN(c)) return reject(translateMessage('en', 'findTargetInvalidResponse'))

          let int = parseInt(c)
          if (int > users.length - 1 || int < 0) return reject(translateMessage('en', 'findTargetInvalidResponse'))

          return resolve(users[int])
        } else {
          if (users.length === 0) return reject(translateMessage('en', 'findTargetNoneFound'))
          return resolve(users[0])
        }

      } catch (e) { console.log(e) }
    }
  })
}

function translateMessage (language, phrase) {
  let languageFile = require(`../language/${language}`)
  return languageFile[phrase]
}

function successReply (message, reply, embed = null) {
  return new Promise(async (resolve, reject) => {
    if (message.channel.type === 'text' && !message.channel.guild.me.permissionsIn(message.channel).has('SEND_MESSAGES')) return reject()

    if (embed) {
      if (message.channel.type === 'text' && !message.channel.guild.me.permissionsIn(message.channel).has('EMBED_LINKS')) return resolve(await message.channel.send(`${reply}\n${embed}`))

      let rE = new Discord.RichEmbed()
      rE.setColor('GREEN')
      rE.setDescription(embed)

      if (message.channel.type === 'text') rE.setFooter(`${translateMessage('en', 'requestedBy')} ${message.author.tag}`)
      return resolve(await message.channel.send(reply, rE))
    }

    return resolve(await message.channel.send(reply))
  })
}

function errorReply (message, reply, embed = null) {
  return new Promise(async (resolve, reject) => {
    if (message.channel.type === 'text' && !message.channel.guild.me.permissionsIn(message.channel).has('SEND_MESSAGES')) return reject()

    if (embed) {
      if (message.channel.type === 'text' && !message.channel.guild.me.permissionsIn(message.channel).has('EMBED_LINKS')) return resolve(await message.channel.send(`${reply}\n${embed}`))

      let rE = new Discord.RichEmbed()
      rE.setColor('RED')
      rE.setDescription(embed)

      if (message.channel.type === 'text') rE.setFooter(`${translateMessage('en', 'requestedBy')} ${message.author.tag}`)
      return resolve(await message.channel.send(reply, rE))
    }

    return resolve(await message.channel.send(reply))
  })
}

module.exports = { start, loadCommands, tryLogToConsole, checkTarget, translateMessage, successReply, errorReply }
