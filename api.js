const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.static('app/dist'))
app.use(express.json())
app.use(morgan(':method :url :status :response-time ms - :date[iso]'))

const axios = require('axios')
const email = (to, subject, content) => process.env.SENDGRID_API_KEY && axios({
  method: 'POST',
  url: 'https://api.sendgrid.com/v3/mail/send',
  headers: {
    'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY,
    'Content-Type': 'application/json'
  },
  data: {
    "personalizations": [{
      "to": [{
        "email": to || process.env.COMMANDR_EMAIL || "robot@100m.io"
      }],
      "subject": subject || "Commandr Run Status"
    }],
    "from": {
      "email": "robot@100m.io"
    },
    "content": [{
      "type": "text/plain",
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
  let subject, current
  if (status === 'success') {
    subject = 'Command ran successfully'
    current = `Command ${cmd.command} ran successfully at ${cmd.run.start.slice(0,10)} ${cmd.run.start.slice(11,16)} in ${msToTime(cmd.run.duration)} on machine ${os.hostname()} ${os.platform()} ${os.arch()}.`
  }
  if (status === 'skip') {
    subject = 'Command skipped'
    current = `Command ${cmd.command} scheduled at ${cmd.run.start.slice(0,10)} ${cmd.run.start.slice(11,16)}  was skipped, previous command was still running.`
  }
  if (status === 'error') {
    subject = 'Command failed'
    current = `Command ${cmd.command} scheduled at ${cmd.run.start.slice(0,10)} ${cmd.run.start.slice(11,16)}  failed to run.`
  }
  const previous = 'Previous runs were at:\n\n' + cmd.runs.slice(-6, -1).map(run => run.start.slice(0, 16)).join('\n\n')
  const nextrun = cmd.nextrun ? cmd.nextrun.toISOString() : ''
  const next = 'Next run scheduled at:\n\n' + nextrun.slice(0, 16)
  const content = `${current}\n\n${previous}\n\n${next}\n\n`
  return email(cmd.email, subject, content)
}

const Sugar = require('sugar')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const cmdpath = path.join(os.homedir(), '.commandr.json')
const running = pid => {
  if (!pid) return false
  try { return process.kill(pid, 0) } catch (e) { return e.code === 'EPERM' }
}
Sugar.extend({ objectPrototype: true })

let timeout = null
const commands = fs.existsSync(cmdpath) ? require(cmdpath) : {}
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
  if (!cmd) return
  delete cmd.skip
  if (cmd.run && running(cmd.run.pid)) return template(cmd, 'skip')
  if (!cmd.runs) cmd.runs = []
  const onsuccess = () => template(cmd, 'success')
  const onerror = () => template(cmd, 'error')
  const start = new Date()
  const program = cmd.command.split(' ')[0]
  const args = cmd.command.split(' ').slice(1)
  const child = spawn(program, args, { detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
  child.unref()
  cmd.run = { start: start.toISOString(), pid: child.pid }
  child.stdout.on('data', data => cmd.run.stdout = data.toString())
  child.stderr.on('data', data => cmd.run.stderr = data.toString())
  child.on('error', err => cmd.run.err = err)
  child.on('close', code => {
    cmd.run.duration = new Date() - start
    cmd.runs.push(cmd.run)
    if (code !== 0 || cmd.run.err || cmd.run.stderr) onerror()
    else onsuccess()
    delete cmd.run
    update_timer()
  })
}
const update_timer = () => {
  clearTimeout(timeout)
  commands.map(next)
  fs.writeFileSync(cmdpath, JSON.stringify(commands))
  const cmd = commands[commands.filter(c => c.nextrun).min('nextrun')]
  if (!cmd) return
  timeout = setTimeout(() => {
    update_timer()
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
  if (!/127.0.0.1/.test(req.ip)) return res.status(401).send('unauthorized_remote_action')
  if (!req.body.command) return res.status(400).send('command_not_specified')
  const id = 'c' + new Date().toISOString()
  const { command, schedule, email, onsuccess, onerror } = req.body
  commands[id] = { id, command, schedule, email, onsuccess, onerror }
  update_timer()
  res.send('Command ID: ' + id)
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

app.listen(1111)
console.log('Starting command-r API on port 1111')
