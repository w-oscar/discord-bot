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
  return new Promise((resolve, reject) => {
    if (phrase.startsWith('<@')) {
      phrase = phrase.replace('!', '')
      phrase = phrase.slice(2).slice(0, -1)
    }

    index.client.fetchUser(phrase)
    .then((user) => resolve(user))
    .catch((error) => reject(error))
  })
}

module.exports = { start, tryLogToConsole, checkTarget }
