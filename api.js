const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.static('app/dist'))
app.use(express.json())
app.use(morgan(':method :url :status :response-time ms - :date[iso]'))

const axios = require('axios')
const email = (subject, content) => process.env.SENDGRID_API_KEY && axios({
  method: 'POST',
  url: 'https://api.sendgrid.com/v3/mail/send',
  headers: {
    'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY,
    'Content-Type': 'application/json'
  },
  data: {
    "personalizations": [{
      "to": [{
        "email": process.env.COMMANDR_EMAIL || "robot@100m.io"
      }],
      "subject": subject || "Commandr Run Status"
    }],
    "from": {
      "email": "robot@100m.io"
    },
    "content": [{
      "type": "text/html",
      "value": content
    }]
  },
})
const msToTime = duration => {
  if (duration < 1000) return duration + 'ms'
  var seconds = parseInt((duration / 1000) % 60)
  var minutes = parseInt((duration / (1000 * 60)) % 60)
  var hours = parseInt((duration / (1000 * 60 * 60)) % 24)
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds
  return hours + ":" + minutes + ":" + seconds
}
const template = (cmd, status) => {
  const symbol = status === 'success' ? '✓' : '✗'
  const subject = `${symbol} Command ${status} - ${cmd.command}`
  const content = `<ul>
    <li>Command: ${cmd.command}</li>
    <li>Status: ${status}</li>
    <li>Start on: ${os.hostname()} - ${os.platform()} - ${os.arch()}</li>
    <li>At: ${cmd.run.start}</li>
    <li>In: ${msToTime(cmd.run.duration)}</li>
    <li>Next: ${cmd.nextrun}</li>
  </ul>`
  return email(subject, content)
}

const Sugar = require('sugar')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const exec = cmd => {
  if (!cmd) return
  const program = cmd.split(' ')[0]
  const args = cmd.split(' ').slice(1)
  const child = spawn(program, args, { detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
  child.unref()
  return child
}
const cmdpath = path.join(os.homedir(), '.commandr.json')
const running = pid => {
  if (!pid) return false
  try { return process.kill(pid, 0) } catch (e) { return e.code === 'EPERM' }
}
Sugar.extend({ objectPrototype: true })

const commands = fs.existsSync(cmdpath) ? require(cmdpath) : {}
let timeout = null
let counter = commands.keys().last() && +commands.keys().last().slice(1) || 0
const next = cmd => {
  if (!cmd.schedule) return cmd
  let t = {
    // TODO: handle year/month
    // Y: 365.25
    // M: 30.6
    D: 24 * 60 * 60 * 1000,
    H: 60 * 60 * 1000,
    M: 60 * 1000,
    S: 1000,
  }
  let [repeat, date, period] = cmd.schedule.split('/')
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
const onsuccess = cmd => {
  template(cmd, 'success')
  exec(cmd.onsuccess)
  commands.filter(d => d.runhook === cmd.id).map(run)
}
const onerror = cmd => {
  template(cmd, 'error')
  exec(cmd.onerror)
}
const close = (cmd, code) => {
  cmd.run.code = code
  cmd.run.error = code !== 0 || cmd.run.err || cmd.run.stderr
  cmd.run.duration = new Date() - new Date(cmd.run.start)
  cmd.runs.push(cmd.run)
  if (cmd.run.error) onerror(cmd)
  else onsuccess(cmd)
  delete cmd.run
  update_timer()
}
const run = cmd => {
  if (!cmd) return
  delete cmd.skip
  if (cmd.run && running(cmd.run.pid)) return template(cmd, 'skip')
  if (!cmd.runs) cmd.runs = []
  const child = exec(cmd.command)
  cmd.run = { start: new Date().iso(), pid: child.pid }
  child.stdout.on('data', data => cmd.run.stdout = data.toString())
  child.stderr.on('data', data => cmd.run.stderr = data.toString())
  child.on('error', err => cmd.run.err = err)
  child.on('close', code => close(cmd, code))
}
const update_timer = () => {
  clearTimeout(timeout)
  commands.map(next)
  fs.writeFileSync(cmdpath, JSON.stringify(commands))
  const nextrun = commands.filter(c => c.nextrun).map('nextrun').values().min()
  if (!nextrun) return
  const cmds = commands.filter({ nextrun })
  timeout = setTimeout(() => {
    update_timer()
    cmds.map(run)
  }, nextrun - new Date())
}
update_timer()

// List all commands and all runs
app.get('/api', (req, res) => {
  res.send({ commands, machine: os.hostname(), notify: process.env.COMMANDR_EMAIL || 'robot@100m.io', counter })
})

// Post new command
app.post('/api', (req, res) => {
  if (!/127.0.0.1/.test(req.ip)) return res.status(401).send('unauthorized_remote_action')
  if (!req.body.command) return res.status(400).send('command_not_specified')
  counter = counter + 1
  const id = 'C' + counter
  const { command } = req.body
  commands[id] = { id, command }
  update_timer()
  res.send('Command ID: ' + id)
})

// Edit command
app.put('/api/:id', (req, res) => {
  if (!/127.0.0.1/.test(req.ip)) return res.status(401).send('unauthorized_remote_action')
  if (!commands[req.params.id]) return res.status(404).send('command_not_found')
  const { schedule, runhook, onsuccess, onerror } = req.body
  commands[req.params.id].schedule = schedule
  commands[req.params.id].runhook = runhook
  commands[req.params.id].onsuccess = onsuccess
  commands[req.params.id].onerror = onerror
  update_timer()
  res.send('OK')
})

// Delete specific command
app.delete('/api/:id', (req, res) => {
  if (!/127.0.0.1/.test(req.ip)) return res.status(401).send('unauthorized_remote_action')
  if (!commands[req.params.id]) return res.status(404).send('command_not_found')
  delete commands[req.params.id]
  update_timer()
  res.send('OK')
})

// Run specific command
app.get('/api/:id/run', (req, res) => {
  if (!commands[req.params.id]) return res.status(404).send('command_not_found')
  run(commands[req.params.id])
  update_timer()
  res.send('OK')
})

// Skip specific command
app.get('/api/:id/skip', (req, res) => {
  if (!commands[req.params.id]) return res.status(404).send('command_not_found')
  commands[req.params.id].skip = true
  update_timer()
  res.send('OK')
})

// Stop/Kill specific command
app.get('/api/:id/kill', (req, res) => {
  if (!commands[req.params.id]) return res.status(404).send('command_not_found')
  if (!commands[req.params.id].run) return res.status(404).send('command_not_running')

  const pid = commands[req.params.id].run.pid
  if (!running(pid)) close(commands[req.params.id])
  if (running(pid) && os.platform() !== 'win32') require('child_process').exec('kill -9 ' + pid)
  if (running(pid) && os.platform() === 'win32') require('child_process').exec('tskill ' + pid)

  update_timer()
  res.send('OK')
})

app.listen(1111)
console.log('Starting command-r API on port 1111')
