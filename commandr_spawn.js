const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const running = pid => {
  if (!pid) return false
  try { return process.kill(pid, 0) }
  catch (e) { return e.code === 'EPERM' }
}

const commandr_spawn = command => {
  fs.existsSync(path.join(os.homedir(), '.commandr')) || fs.mkdirSync(path.join(os.homedir(), '.commandr'))
  fs.existsSync(path.join(os.homedir(), '.commandr', 'commands')) || fs.mkdirSync(path.join(os.homedir(), '.commandr', 'commands'))
  let pidpath = path.join(os.homedir(), '.commandr', 'commandr.pid')
  let program = 'node'
  let args = ['api.js']
  if (command) {
    pidpath = path.join(os.homedir(), '.commandr', 'commands', command.id + '.pid')
    program = command.command.split(' ')[0]
    args = command.command.split(' ').slice(1)
  }

  const pid = fs.existsSync(pidpath) && fs.readFileSync(pidpath, 'utf8')
  if (running(pid)) return { pid, running: true, child: null }

  const out = fs.openSync(pidpath.replace('pid', 'log'), 'a')
  const err = fs.openSync(pidpath.replace('pid', 'err'), 'a')
  const child = spawn(program, args, { detached: true, stdio: ['ignore', out, err] })
  child.unref()
  fs.writeFileSync(pidpath, child.pid)
  return { pid: child.pid, running: false, child }
}

module.exports = commandr_spawn
