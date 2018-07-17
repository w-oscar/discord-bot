const util = require('../util.js')

module.exports = async (message) => {
  util.tryLogToConsole(1, `${message.author.tag} -> ${message.content}`)

  try {
    let user = await util.checkTarget(message, message.content)
    console.log(`User Found: ${user.id}`)
  } catch (e) {

  }
}
