const { spawn } = require('child_process')
const startDevServer = spawn('cmd', ['/c', 'npm', 'start'], { stdio: 'inherit', shell: true })
const electron = spawn('cmd', ['/c', 'npx', 'electron', '.'], { stdio: 'inherit', shell: true })

process.on('SIGINT', () => {
  electron.kill()
  startDevServer.kill()
  process.exit(0)
})
