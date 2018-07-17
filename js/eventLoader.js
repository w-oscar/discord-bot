const requestEvent = (event) => require(`./events/${event}`)

module.exports = (client) => {
  client.once('ready', () => requestEvent('ready')(client))

  client.on('message', requestEvent('message'))
}
