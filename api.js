const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.static('static'))
app.use(express.json())
app.use(morgan(':method :url :status :response-time ms - :date[iso]'))

// TODO: Test on Windows
// TODO: Use setTimeout to run next command
// TODO: Use Proxy to automatically reset then set next timeout
// TODO: Use Proxy to automatically save "commands" state to ~/.commander/commands.json
// TODO: Automatically reload commands from file
let timeout = null
const commands = {}

// List all commands and all stats
app.get('/api', (req, res) => {
  res.send(commands)
})

// Post new command
app.post('/api', (req, res) => {
  if (!req.body.id || !req.body.command || !req.body.schedule || !/P(\d|T)/.test(req.body.schedule)) return res.status(400).send('Invalid params')
  if (commands[req.body.id]) return res.status(403).send('Command exists')
  commands[req.body.id] = req.body
  res.send('Command ID: ' + req.body.id)
})

// Delete specific command
app.delete('/api/:id', (req, res) => {
  if (commands[req.body.id]) return res.status(404).send('Command not found')
  delete commands[req.params.id]
  res.send('OK')
})

app.listen(1111)
console.log('Starting commandr API on port 1111')
