const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const running = pid => {
  try { return process.kill(pid, 0) }
  catch (e) { return e.code === 'EPERM' }
}

const spwn = command => {
  const pidpath = command
    ? path.join(os.homedir(), '.commandr', 'commands', command.name, 'pid')
    : path.join(os.homedir(), '.commandr', 'pid')
  const pid = fs.existsSync(pidpath) && fs.readFileSync(pidpath, 'utf8')
  if (running(pid)) return { pid, running: true }
  fs.existsSync(pidpath.replace('pid', '')) || fs.mkdirSync(pidpath.replace('pid', ''))
  const out = fs.openSync(pidpath.replace('pid', 'log'), 'a')
  const err = fs.openSync(pidpath.replace('pid', 'err'), 'a')
  const child = spawn('node', ['api.js'], { detached: true, stdio: ['ignore', out, err] })
  child.unref()
  fs.writeFileSync(pidpath, child.pid)
  return { pid, running: false }
}

module.exports = spwn
