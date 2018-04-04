const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const fs = require('fs')
const Sugar = require('sugar')
const os = require('os')
const path = require('path')
const { spawn, execSync } = require('child_process')
const app = express()

require('dotenv').config()

if (process.env.ENV === 'dev')
  app.use((req, res, next) => {
    if (/^\/api/.test(req.url)) return next()
    return axios
      .get('http://127.0.0.1:8080' + req.url)
      .then(r => res.send(r.data))
      .catch(err => console.error('Proxy Error', req.url))
  })
if (process.env.ENV !== 'dev') app.use(express.static('dist'))

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n')
  return `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
}

function authMiddleware(req, res, next) {
  if (!/127.0.0.1/.test(req.ip)) return res.status(401).send('unauthorized_remote_action')
  const decodedToken = jwt.decode(req.query.auth0_token, { complete: true })
  axios
    .get(`https://${req.query.auth0_domain}/.well-known/jwks.json`)
    .then(res => {
      const key = res.data.keys.find(d => d.kid === decodedToken.header.kid)
      jwt.verify(req.query.auth0_token, certToPEM(key.x5c[0]), (err, decoded) => {
        if (err) return res.status(401).send(err)
        req.token = decoded
        if (req.query.uid) {
          const metadata = req.token['https://100m.io/app_metadata']
          if (!metadata || !(metadata.role === 'admin' || metadata.authorized_access.includes(req.query.uid))) return res.status(401).send('unauthorized')
        }
        req.uid = (req.query.uid || req.token.email).replace(/@/g, 'AT').replace(/\./g, 'DOT')
        next()
      })
    })
    .catch(err => res.status(401).send('authentication_error'))
}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(authMiddleware)
// TODO: logger - ':method :url :status :response-time ms - :date[iso]'

const email = (subject, content) =>
  process.env.SENDGRID_API_KEY &&
  axios({
    method: 'POST',
    url: 'https://api.sendgrid.com/v3/mail/send',
    headers: {
      Authorization: 'Bearer ' + process.env.SENDGRID_API_KEY,
      'Content-Type': 'application/json',
    },
    data: {
      personalizations: [
        {
          to: [
            {
              email: process.env.COMMANDR_EMAIL || 'robot@100m.io',
            },
          ],
          subject: subject || 'Commandr Run Status',
        },
      ],
      from: {
        email: 'robot@100m.io',
      },
      content: [
        {
          type: 'text/html',
          value: content,
        },
      ],
    },
  })
const simplify = cmd => {
  if (!/(\\|\/)/.test(cmd)) return cmd
  return cmd
    .replace(/['"]/g, '')
    .split(' ')
    .last()
    .split(/(\\|\/)/)
    .last()
}
const template = (cmd, status) => {
  if (!cmd.run || !cmd.run.duration) return (cmd.run && cmd.run.start && new Date() - new Date(cmd.run.start) < 10000) || email('✗ Command Scheduling Error', JSON.stringify(cmd))
  const symbol = status === 'success' ? '✓' : '✗'
  const subject = `${symbol} Command ${status} - ${simplify(cmd.command)}`
  const content = `<ul>
    <li>Command: ${cmd.command}</li>
    <li>Status: ${status}</li>
    <li>Start on: ${os.hostname()} - ${os.platform()} - ${os.arch()}</li>
    <li>Start At: ${new Date(cmd.run.start).iso().slice(0, 16) + 'Z'}</li>
    <li>Duration: ${cmd.run.duration.duration()}</li>
    <li>Next Schedule: ${(cmd.nextrun && new Date(cmd.nextrun).iso().slice(0, 16) + 'Z') || 'never'}</li>
    <li>Output: <code><pre>${[cmd.run.stdout, cmd.run.stderr, cmd.run.err].filter(x => x).join(' // ') || 'null'}</pre></code></li>
  </ul>`
  return email(subject, content)
}

const exec = cmd => {
  if (!cmd) return
  const program = cmd.split(' ')[0]
  const args = cmd.split(' ').slice(1)
  const child = spawn(program, args, { shell: true, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
  child.unref()
  return child
}
const cmdpath = path.join(os.homedir(), '.commandr.json')
const running = pid => {
  if (!pid) return false
  try {
    return process.kill(pid, 0)
  } catch (e) {
    return e.code === 'EPERM'
  }
}
Sugar.extend({ objectPrototype: true })

const commands = fs.existsSync(cmdpath) ? require(cmdpath) : {}
let timeout = null
let counter =
  (commands.keys().last() &&
    +commands
      .keys()
      .last()
      .slice(1)) ||
  0
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
  period = period
    .replace(/(P|T)/g, '')
    .match(/\d*[A-Z]/g)
    .map(p => +p.slice(0, -1) * t[p.slice(-1)])
    .sum()

  if (!repeat || !date || !period) return null
  if (+date > +new Date()) return date
  const num = (new Date() - date) / period
  if (num > repeat - 1) return null

  cmd.nextrun = new Date(+date + Math.ceil(num) * period)
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
  if (!cmd.run) return // TODO: catch this error
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
  if (!cmd || !cmd.command) return
  delete cmd.skip
  if (cmd.run && running(cmd.run.pid)) return template(cmd, 'skip')
  if (!cmd.runs) cmd.runs = []
  const child = exec(cmd.command)
  cmd.run = { start: new Date().iso(), pid: child.pid }
  child.stdout.on('data', data => (cmd.run.stdout = data.toString()))
  child.stderr.on('data', data => (cmd.run.stderr = data.toString()))
  child.on('error', err => (cmd.run.err = err))
  child.on('close', code => close(cmd, code))
}
const update_timer = () => {
  clearTimeout(timeout)
  commands.map(next)
  fs.writeFileSync(cmdpath, JSON.stringify(commands))
  const nextrun = commands
    .filter(c => c.nextrun)
    .map('nextrun')
    .values()
    .min()
  if (!nextrun) return
  const cmds = commands.filter({ nextrun })
  timeout = setTimeout(() => {
    update_timer()
    cmds.map(run)
  }, nextrun - new Date())
}
const check_command = command => {
  const program = command.split(' ')[0]
  if (!program) return true // empty case
  if (fs.existsSync(program)) return true
  try {
    execSync('which ' + program)
    return true
  } catch (e) {
    return false
  }
  return false
}

commands.map(cmd => delete cmd.run) // NOTE: We lose track of running command on restart
update_timer()

// List all commands and all runs
app.get('/api', (req, res) => {
  res.send({ commands, machine: os.hostname(), notify: process.env.COMMANDR_EMAIL || 'robot@100m.io', counter })
})

// Post new command
app.post('/api', (req, res) => {
  if (!req.body.command || !check_command(req.body.command)) return res.status(400).send('command_not_specified')
  counter = counter + 1
  const id = 'C' + counter
  const { command } = req.body
  commands[id] = { id, command }
  update_timer()
  res.send('Command ID: ' + id)
})

// Edit command
app.put('/api/:id', (req, res) => {
  if (!commands[req.params.id]) return res.status(404).send('command_not_found')
  const { command, schedule, runhook, onsuccess, onerror } = req.body
  if (!(check_command(command) && check_command(onsuccess) && check_command(onerror))) {
    const results = {
      command: check_command(command),
      onsuccess: check_command(onsuccess),
      onerror: check_command(onerror),
    }
    return res.status(400).send(results)
  }
  commands[req.params.id].command = command
  commands[req.params.id].schedule = schedule
  if (!schedule) commands[req.params.id].nextrun = null
  commands[req.params.id].runhook = runhook
  commands[req.params.id].onsuccess = onsuccess
  commands[req.params.id].onerror = onerror
  update_timer()
  res.send('OK')
})

// Delete specific command
app.delete('/api/:id', (req, res) => {
  if (!commands[req.params.id]) return res.status(404).send('command_not_found')
  delete commands[req.params.id]
  update_timer()
  res.send('OK')
})

// // Get command
// app.get('/api/:id', (req, res) => {
//   if (!commands[req.params.id]) return res.status(404).send('command_not_found')
//   const command = commands[req.params.id]
//   return res.send({ command })
// })
//
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

  commands[req.params.id].run.stderr = commands[req.params.id].run.stderr || 'Task Killed'
  const pid = commands[req.params.id].run.pid
  if (!running(pid)) close(commands[req.params.id])
  if (running(pid) && os.platform() !== 'win32') require('child_process').exec('kill -9 ' + pid)
  if (running(pid) && os.platform() === 'win32') require('child_process').exec('tskill ' + pid)

  update_timer()
  res.send('OK')
})

app.listen(1111)
console.log('Starting command-r API on port 1111')
