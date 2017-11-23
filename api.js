const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.static('static'))
app.use(express.json())
app.use(morgan(':method :url :status :response-time ms - :date[iso]'))

const Sugar = require('sugar')
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
Sugar.extend({ objectPrototype: true })

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
const next = cmd => {
  const schedule = cmd.schedule
  if (!schedule) return null
  let t = {
    // TODO: handle year/month
    // Y: 365.25
    // M: 30.6
    D: 24 * 60 * 60 * 1000,
    H: 60 * 60 * 1000,
    M: 60 * 1000,
    S: 1000,
  }
  let [repeat, date, period] = schedule.split('/')
  repeat = repeat.slice(1) === '' ? Infinity : +repeat.slice(1)
  date = new Date(date)
  period = period.replace(/(P|T)/g, '').match(/\d*[A-Z]/g).map(p => +p.slice(0, -1) * t[p.slice(-1)]).sum()

  if (!repeat || !date || !period) return null
  if (+date > +new Date()) return date
  const num = (new Date() - date) / period
  if (num > repeat - 1) return null

  cmd.nextrun = new Date(+date + (Math.ceil(num) * period))
  if (cmd.skip) cmd.nextrun = cmd.nextrun + period
  return cmd
}
const run = cmd => {
  delete cmd.skip
  if (!cmd.runs) cmd.runs = []
  const program = cmd.command.split(' ')[0]
  const args = cmd.command.split(' ').slice(1)
  const child = spawn(program, args, { detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
  child.unref()
  const start = new Date()
  cmd.run = { start: start.toISOString(), pid: child.pid }
  child.stdout.on('data', data => cmd.run.stdout = data.toString())
  child.stderr.on('data', data => cmd.run.stderr = data.toString())
  child.on('close', code => {
    cmd.run.duration = new Date() - start
    cmd.runs.push(cmd.run)
    delete cmd.run
    update_timer()
  })
  child.on('error', err => {
    cmd.run.duration = new Date() - start
    cmd.run.error = err
    cmd.runs.push(cmd.run)
    delete cmd.run
    update_timer()
  })
}
const update_timer = () => {
  clearTimeout(timeout)
  commands.map(next)
  const cmd = commands[commands.filter(c => c.nextrun).min('nextrun')]
  if (!cmd) return
  timeout = setTimeout(() => {
    update_timer()
    if (cmd.run && running(cmd.run.pid)) return console.error('Command was scheduled but is still running', cmd)
    run(cmd)
  }, cmd.nextrun - new Date())
}
update_timer()

// List all commands and all runs
app.get('/api', (req, res) => {
  res.send(commands)
})

// Post new command
app.post('/api', (req, res) => {
  if (!req.body.command) return res.status(400).send('Command not specified')
  const id = 'c' + new Date().toISOString()
  const { command, schedule } = req.body
  commands[id] = { id, command, schedule }
  res.send('Command ID: ' + id)
})

// Delete specific command
app.delete('/api/:id', (req, res) => {
  if (!commands[req.params.id]) return res.status(404).send('Command not found')
  delete commands[req.params.id]
  res.send('OK')
})

// Run specific command
app.get('/api/:id/run', (req, res) => {
  if (!commands[req.params.id]) return res.status(404).send('Command not found')
  run(commands[req.params.id])
  res.send('OK')
})

// Skip specific command
app.get('/api/:id/skip', (req, res) => {
  if (!commands[req.params.id]) return res.status(404).send('Command not found')
  commands[req.params.id].skip = true
  res.send('OK')
})

app.listen(1111)
console.log('Starting command-r API on port 1111')
