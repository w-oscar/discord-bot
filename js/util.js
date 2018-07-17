const config = require('../config.json')

const data = require('./data.js')
const index = require('../index.js')

async function start () {
  index.client.login(config.bot.token)
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
          message.channel.send(sendMessage)
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
  return languageFile[`${phrase}`]
}

module.exports = { start, tryLogToConsole, checkTarget }
