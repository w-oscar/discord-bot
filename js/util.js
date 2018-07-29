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
      } catch (e) {
        return reject(translateMessage('en', 'findTargetNoneFound'))
      }
    }

    if (message.guild.available) {
      try {
        let guildMembers = message.guild.members

        if (message.guild.large) guildMembers = await message.guild.fetchMembers
        let members = guildMembers.filter((guildMember) => guildMember.displayName.toLowerCase().includes(phrase.toLowerCase())).array()

        if (members.length > 1) {
          let sendMessage = `\`\`\``

          for (let i = 0; i < members.length || i > 6; i++) {
            sendMessage += `\n${i} | ${members[i].displayName} (${members[i].user.tag}) [${members[i].id}]`
          }

          sendMessage += `\`\`\``
          await successReply(message, sendMessage, translateMessage('en', 'findTargetMultiple"'))

          let caughtMessages = await message.channel.awaitMessages((m) => m.author === message.author, { maxMatches: 1, time: 15000, errors: ['time'] })
          let caughtMessage = caughtMessages.array()
          let c = caughtMessage[0].content

          if (isNaN(c)) return reject(translateMessage('en', 'findTargetInvalidResponse'))

          let int = parseInt(c)
          if (int > members.length - 1 || int < 0) return reject(translateMessage('en', 'findTargetInvalidResponse'))

          return resolve(members[int].user)
        } else {
          if (members.length === 0) return reject(translateMessage('en', 'findTargetNoneFound'))
          if (members.length === 1) return resolve(members[0].user)
        }
      } catch (e) {
        // console.log(e)
      }
    } else {

    }

    /*
    index.client.fetchUser(phrase)
    .then((user) => resolve(user))
    .catch((error) => reject(error))
    */
  })
}

function translateMessage (language, phrase) {
  let languageFile = require(`../language/${language}`)
  return languageFile[phrase]
}

function successReply (message, reply, embed = null) {
  return new Promise(async (resolve, reject) => {
    if (message.channel.type === 'text' && !message.channel.guild.member(index.client.user).permissionsIn(message.channel).has('SEND_MESSAGES')) return reject()

    if (embed) {
      if (message.channel.type === 'text' && !message.channel.guild.member(index.client.user).permissionsIn(message.channel).has('EMBED_LINKS')) return resolve(await message.channel.send(`${reply}\n${embed}`))

      return resolve(await message.channel.send(reply, {
        embed: {
          color: 0x2ECC71,
          description: embed,
          footer: {
            text: `To: ${message.author.tag}`
          }
        }
      }))
    }

    return resolve(await message.channel.send(reply))
  })
}

function errorReply (message, reply, embed = null) {
  return new Promise(async (resolve, reject) => {
    if (message.channel.type === 'text' && !message.channel.guild.member(index.client.user).permissionsIn(message.channel).has('SEND_MESSAGES')) return reject()

    if (embed) {
      if (message.channel.type === 'text' && !message.channel.guild.member(index.client.user).permissionsIn(message.channel).has('EMBED_LINKS')) return resolve(await message.channel.send(`${reply}\n${embed}`))

      return resolve(await message.channel.send(reply, {
        embed: {
          color: 0xE74C3C,
          description: embed,
          footer: {
            text: `To: ${message.author.tag}`
          }
        }
      }))
    }

    return resolve(await message.channel.send(reply))
  })
}

module.exports = { start, loadCommands, tryLogToConsole, checkTarget, translateMessage, successReply, errorReply }
