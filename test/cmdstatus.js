const { spawn } = require('child_process')
const exec = cmd => {
  if (!cmd) return
  const program = cmd.split(' ')[0]
  const args = cmd.split(' ').slice(1)
  // const child = spawn(program, args, { shell: true, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
  const child = spawn(program, args, { shell: true })
  // child.unref()
  return child
}
const c = 'python C:\\Users\\vbrajon\\100m\\command-r\\cmdstatus.py'
const child = exec(c)
const info = { start: new Date(), pid: child.pid }
child.stdout.on('data', data => console.log('stdout', '' + data))
child.stderr.on('data', data => console.log('stderr', '' + data))
child.on('error', data => console.log('error', data))
child.on('exit', data => console.log('exit', data))
child.on('close', data => console.log('close', data))
child.on('disconnect', data => console.log('disconnect', data))
child.on('message', data => console.log('message', data))

// var spawn = require('child_process').spawn
// var child = spawn(c.split(' ')[0], c.split(' ').slice('1'), { shell: true })
// child.stdout.on('data', function(data) { console.log('stdout: ' + data) })
// child.stderr.on('data', function(data) { console.log('stderr: ' + data) })
// child.on('close', function(code) { console.log('closing code: ' + code) })
