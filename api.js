const express = require('express')
const app = express()
const morgan = require('morgan')
const cmdspawn = require('./cmdspawn')

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

commands.echo = { id: 'echo', command: 'echo "toto"', schedule: 'PT10S' }
setInterval(() => {
  const command = commands.echo
  const { pid, running, child } = cmdspawn(command)
  const start = new Date()
  // console.log('command start', pid, command.id)
  if (running) return console.log('command running', pid, command.id)
  // child.on('close', code => console.log('command stopped', pid, command.id))
  child.on('close', code => {
    if (!commands.echo.stats) commands.echo.stats = []
    commands.echo.stats.push({
      start: start.toISOString(),
      duration: new Date() - start,
    })
  })
}, 1000)

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
console.log('Starting command-r API on port 1111')
