process.on('message', (msg) => {
  const {event, data} = msg
  const result = handlers[event](data)
  process.send(result)
})

handlers = {
  // TODO: eventName: function
}
