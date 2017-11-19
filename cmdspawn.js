const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const running = pid => {
  if (!pid) return false
  try { return process.kill(pid, 0) }
  catch (e) { return e.code === 'EPERM' }
}

const cmdspawn = command => {
  fs.existsSync(path.join(os.homedir(), '.command-r')) || fs.mkdirSync(path.join(os.homedir(), '.command-r'))
  fs.existsSync(path.join(os.homedir(), '.command-r', 'commands')) || fs.mkdirSync(path.join(os.homedir(), '.command-r', 'commands'))
  let pidpath = path.join(os.homedir(), '.command-r', 'command-r.pid')
  let program = 'node'
  let args = ['api.js']
  if (command) {
    pidpath = path.join(os.homedir(), '.command-r', 'commands', command.id + '.pid')
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

module.exports = cmdspawn
