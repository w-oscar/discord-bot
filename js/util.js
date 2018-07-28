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

    if (message.guild.available) {
      try {
        let guildMembers = message.guild.members

        if (message.guild.large) guildMembers = await message.guild.fetchMembers
        let members = guildMembers.filter((guildMember) => guildMember.displayName.toLowerCase().includes(phrase.toLowerCase())).array()

        if (members.length > 1) {
          let sendMessage = `${translateMessage('en', 'findTargetMultiple')}\`\`\``

          for (let i = 0; i < members.length || i > 6; i++) {
            sendMessage += `\n${i} | ${members[i].displayName} (${members[i].user.tag}) [${members[i].id}]`
          }

          sendMessage += `\`\`\``
          await message.channel.send(sendMessage)

          let caughtMessages = await message.channel.awaitMessages((m) => m.author === message.author, { maxMatches: 1, time: 15000, errors: ['time'] })
          caughtMessages = caughtMessages.array()

          let replyMessage = caughtMessages[0]
          let c = replyMessage.content

          if (isNaN(c)) reject(translateMessage('en', 'findTargetInvalidResponse'))
          let int = parseInt(c)

          if (int > members.length || int < 0) reject(translateMessage('en', 'findTargetInvalidResponse'))
          resolve(members[int])
        } else {
          if (members.length === 0) reject(translateMessage('en', 'findTargetNoneFound'))
          if (members.length === 1) resolve(members[0])
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

module.exports = { start, loadCommands, tryLogToConsole, checkTarget, translateMessage }
