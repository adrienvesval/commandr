const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.static('static'))
app.use(express.json())
app.use(morgan(':method :url :status :response-time ms - :date[iso]'))

// TODO: Test on Windows
// Use setTimeout to run next command
// Use Proxy to automatically reset then set next timeout
// Use Proxy to automatically save "commands" state to ~/.commander/commands.json
// Automatically reload commands from json file
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const cmdpath = path.join(os.homedir(), '.commandr.json')
const running = pid => {
  if (!pid) return false
  try { return process.kill(pid, 0) }
  catch (e) { return e.code === 'EPERM' }
}

let timeout = null
const commands = new Proxy(fs.existsSync(cmdpath) ? require(cmdpath) : {}, {
  set: (obj, key, value) => {
    if (obj[key]) return false
    obj[key] = value
    fs.writeFileSync(cmdpath, JSON.stringify(obj))
    update_timer()
    return true
  },
  deleteProperty: function (obj, key) {
    if (!obj[key]) return false
    delete obj[key]
    fs.writeFileSync(cmdpath, JSON.stringify(obj))
    update_timer()
    return true
  },
})
const update_timer = () => {
  clearTimeout(timeout)

  let next = null
  for (var command in commands) {
    if (commands.hasOwnProperty(command)) {
      if (!next || command.schedule > next.schedule) next = commands[command]
    }
  }

  if (!next) return
  timeout = setTimeout(() => {
    if (running(next.command.id)) return console.log('Command still running !!')

    const program = next.command.split(' ')[0]
    const args = next.command.split(' ').slice(1)
    const child = spawn(program, args, { detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
    child.unref()
    next.command.id = child.pid
    if (!next.runs) next.runs = []
    const start = new Date()
    const stat = { start: start.toISOString() }
    child.stdout.on('data', data => stat.stdout = data.toString())
    child.stderr.on('data', data => stat.stderr = data.toString())
    child.on('close', code => {
      stat.duration = new Date() - start
      next.runs.push(stat)
    })

    update_timer()
  }, 1000)
}
update_timer()

// List all commands and all runs
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
