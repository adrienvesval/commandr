# Commandr
> Command scheduler

### Usage
```bash
npm install -g command-r
command-r start
open http://127.0.0.1:1111
```

### Features
- command add/del/list
- command stats/logs
- hook onerror/onsuccess
- nice UI/UX > on http://127.0.0.1:1111

### Plugins
- commandr-notify > Core?
- commandr-export * Optionnal
- commandr-preview * Optionnal
- commandr-scrap * Optionnal

### API - CURL Exemple:
```bash
curl -X POST -H 'Content-Type: application/json' 127.0.0.1:1111/api -d '{ "id": "command1", "command": "echo 1", "schedule": "R/2017-11-17T00:00:00.000Z/PT10S" }'
curl -X POST -H 'Content-Type: application/json' 127.0.0.1:1111/api -d '{ "id": "command2" }'
curl -X POST -H 'Content-Type: application/json' 127.0.0.1:1111/api -d '{ "id": "command3", "command": "echo 1", "schedule": "R/2017-11-17T00:00:00.000Z/PT10S" }'
curl -X GET 127.0.0.1:1111/api
curl -X DELETE 127.0.0.1:1111/api/command3
```

### API - Params:
- id: string
- command: string - command
- onerror*: string - command
- onsuccess*: string - command
- schedule: string - ISO 8601
  > PT10S === R/tonight/PT10S === Every 10sec starting from tonight 0AM
  > R20/2017-11-14T19:25/PT10S === Every 10sec starting from 14 Nov 2017, repeat 20 times then stop

### Extended Usage:
```bash
commandr # > display short help + status
commandr -h # > display full help
commandr [cmd] -h # display command help
commandr start/stop/status
```

### Inspiration
- https://github.com/ajvb/kala
- https://github.com/mesos/chronos
- https://github.com/Netflix/Fenzo
