const Discord = require('discord.js')
const client = new Discord.Client()

module.exports = { client }

process.on('unhandledRejection', err => console.error(`Uncaught Promise Error: \n${err.stack}`))

require('./js/util').start()
require('./js/eventLoader')(client)
