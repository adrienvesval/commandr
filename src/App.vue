<style>
/* @import url('https://cdn.rawgit.com/vbrajon/rawcss/8268557fd641c8f5bd705db9dfff06c42f1748fd/raw.css'); */
@import url('https://rawcss.com/raw.css');
@import url('https://fonts.googleapis.com/css?family=Lato:100,300,400,900');
:root {
  --background-1: #f6f9fd;
  --highlight: rgba(255, 221, 68, 0.5);
  --high: #fd4;
}
html {
  font-family: Lato;
}
body {
  background: var(--background-1);
}
a {
  cursor: pointer;
}
a:before {
  left: 0;
}
h1 {
  height: 60px;
  line-height: 60px;
  font-size: 16px;
  text-transform: uppercase;
  text-align: center;
  border-bottom: var(--border);
  background: var(--background);
}
[container] {
  max-width: 100vw;
  padding: 8px;
  overflow: auto;
}
.kpi,
.kpi-timer {
  min-width: 300px !important;
  min-height: 80px;
  background: var(--background);
  box-shadow: var(--box-shadow);
  margin: 4px 0;
  height: auto !important;
}
input {
  width: 180px;
}
input:disabled {
  outline: none;
}
input[name='id'] {
  min-width: 35px;
  max-width: 35px;
}
input[name='runhook'] {
  width: 200px;
  margin: 0 2px 0 0;
}
input[name='search'] {
  margin-left: auto;
}
input[name='command'] {
  width: 200px;
}
input::-webkit-clear-button {
  -webkit-appearance: none;
  margin: 0;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
label,
input {
  display: inline-block;
}
label {
  margin: 0 4px;
}
label input {
  margin: 0 2px;
}
[xs] {
  font-size: 9px;
}

pre {
  position: relative;
  padding: 10px;
  border: 1px dashed rgba(0, 30, 80, 0.3);
  font-size: 10px;
}
pre::before {
  position: absolute;
  top: -11px;
  left: 0;
  width: 120px;
  background: var(--background-1);
  text-align: center;
}
pre.stdout::before {
  content: 'Standard Output';
  color: #63c261;
}
pre.stderr::before {
  content: 'Error Output';
  color: #db2e65;
}

form.edit label {
  margin: 20px 0;
}

.drawer .slot {
  padding: 20px;
}
.drawer h3 {
  text-align: center;
  margin: 20px;
}
.drawer button[type='submit'] {
  margin: 5px 30px 5px auto;
}

.header .day {
  position: relative;
}
.header .day button {
  position: absolute;
  top: 0;
  min-width: initial;
  margin: 0;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
}
.header .day button:first-child {
  left: 0;
}
.header .day button:last-child {
  right: 0;
}

.cmd {
  position: relative;
  max-width: 100%;
}
.cmd [tt] {
  position: inherit;
}
.cmd.new {
  padding: 10px;
}
.cmd.highlight {
  background: var(--highlight) !important;
}
.cmd.header {
  background: #e0eaff;
  font-weight: 700;
}
.cmd.header > * {
  padding: 10px;
}
.cmd.item:nth-child(odd) {
  background: rgba(0, 0, 0, 0.03);
}
.cmd.item:hover {
  background: rgba(0, 0, 0, 0.08);
}
.cmd.item > * {
  padding: 10px 0;
  line-height: 1.2;
}
.cmd > * {
  min-height: 100%;
}
.cmd .name {
  min-width: 200px;
  font-weight: 700;
}
.cmd .name > div:first-child {
  display: flex;
  width: 100%;
}
.cmd .name > div:first-child > span:first-child {
  margin-right: auto;
}
.cmd .action {
  width: 60px;
}
.cmd-full {
  flex: 1 1 auto;
  word-break: break-all;
}
.nexttime {
  width: 150px;
  padding: 0 10px;
}
.day {
  margin: 0 4px;
  margin-left: auto;
  min-width: 175px;
}
.table-list {
  background: var(--background);
  box-shadow: var(--box-shadow);
  width: 100%;
  min-width: 100%;
  font-size: 80%;
}
.table-list .cell {
  margin: 1px;
  width: 10px;
  height: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #606a7f;
  color: white !important;
  font-size: 12px;
  font-weight: 900;
}
.table-list .cell.future {
  background: #b0bacf;
}
.table-list .cell.running {
  background: #fd4;
}
.table-list .cell.positive {
  background: #63c261;
}
.table-list .cell.negative {
  background: #db2e65;
}
.table-list .sort {
  color: var(--primary);
}
.table-list .desc,
.table-list .asc {
  cursor: pointer;
  user-select: none;
}
.table-list .sort::after {
  margin-left: 4px;
}
.table-list .sort.asc::after {
  content: '\25B3';
}
.table-list .sort.desc::after {
  content: '\25BD';
}
.login form {
  height: 100%;
}
.login fieldset {
  margin-bottom: 20px;
}
.login label {
  margin: 0 50px;
  font-size: 80%;
  text-transform: uppercase;
}
.login input {
  margin: 0 50px;
}
.login button[type='submit'] {
  margin: 0;
}
.cmd-full .cmd-full {
  justify-content: center;
}
@media (min-width: 1000px) {
  body {
    font-size: 16px;
  }
  [container] {
    width: 1400px;
    max-width: calc(100% - 100px);
    margin: auto;
  }
  .kpi,
  .kpi-timer {
    margin: 16px;
  }
  input[name='command'] {
    width: 400px;
  }
  .cmd.item > * {
    padding: 10px;
  }
  .cmd-full .cmd-full {
    justify-content: left;
  }
  .table-list {
    min-width: 600px;
  }
}
@media (max-width: 1000px) {
  .cmd-full {
    max-width: 200px;
    flex-wrap: wrap;
  }
  .cmd-full div {
    flex: 1 1 auto;
    flex-wrap: wrap;
    padding-top: 5px;
    text-align: center;
  }
}
</style>

<template>
<main>
  <h1>Command Scheduler</h1>
  <button style="position: absolute;top: 12px;right: 12px;" @click="logout" v-if="!local">LOGOUT</button>
  <section container grid>
    <kpi :data="[['Machine', machine], ['Notify', notify], ['Cmds', commands.v().length], ['Runs', runs], ['Errors', errors]]" />
    <div class="kpi-timer" row center around>
      <span column>
        <span>Next Run</span>
        <span style="font-weight: 700;font-size: 18px;line-height: 18px;">{{ nextcmd.command && nextcmd.id.replace('C', '#') + ': ' + simplify(nextcmd.command) }}</span>
      </span>
      <timer :time="nextcmd.nextrun" @time="list"></timer>
    </div>
  </section>
  <section container>
    <div class="table-list">
      <form class="cmd new" row @submit.prevent="add($event.target)">
        <div v-if="local">
          <input type="text" name="id" :value="'#' + (counter + 1)" disabled />
          <input type="text" name="command" placeholder="Command" required />
          <button>ADD</button>
        </div>
        <input left type="text" name="search" placeholder="Search" v-model="search" />
      </form>
      <div class="cmd header" row>
        <div :class="{ sort: sort === 'id', desc: desc, asc: !desc }" @click="desc = sort === 'id' ? !desc : true;sort = 'id'">ID</div>
        <div :class="{ sort: sort === 'command', desc: desc, asc: !desc }" @click="desc = sort === 'command' ? !desc : true;sort = 'command'" f1>Command</div>
        <div class="day" row center>
          <button @click="prev">&lt;</button>
          {{ day }}
          <button @click="next">&gt;</button>
        </div>
      </div>
      <div class="cmd item" row v-for="command in commands.v().sortBy(sort, desc)" :key="command.id" v-if="!search || search === command.id || new RegExp(search, 'i').test(command.command)">
        <div row center>{{ command.id.replace('C', '#') }}</div>
        <div class="cmd-full" f1 row center>
          <div class="cmd-full" f1 row center left tt="Click to Edit" @click="popup_edit = command" v-if="mobile">{{ command.command.split(' ')[command.command.split(' ').length -1] }}</div>
          <div class="cmd-full" f1 row center left tt="Click to Edit" @click="popup_edit = command" v-else>{{ command.command }}</div>
          <div row center><span class="nexttime">{{ nexttime(command) }}</span></div>
          <div row center>
            <button @click="del(command.id)" v-if="local">DEL</button>
            <button @click="kill(command.id)" v-if="command.run">KILL</button>
            <button @click="run(command.id)" v-if="!command.run">RUN</button>
          </div>
        </div>
        <div class="day" row center tt="Click to See Logs" @click="popup_logs = command">
          <div class="cells" column v-for="(cell, index) in cells(command)" :key="index">
            <div class="cell positive" v-if="cell.positive">{{ cell.positive }}</div>
            <div class="cell running" v-if="cell.running"></div>
            <div class="cell" :class="{ [(day + 'T' + index * 2)]: true, future: (day + 'T' + ('0' + index * 2).slice(-2)) > new Date().iso().slice(0, 13) }" v-if="!cell.positive && !cell.running && !cell.running"></div>
            <div class="cell negative" v-if="cell.negative">{{ cell.negative }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <drawer @close="popup_edit = null" :openned="!!popup_edit">
    <form class="cmd edit" column @submit.prevent="edit(popup_edit.id, $event.target)">
      <h3>Task {{ popup_edit && popup_edit.id.replace('C', '#') }} - Edit</h3>
      <label row center left>Command: <input full type="text" name="command" required @input="$event.target.setCustomValidity('')" /></label>
      <label row center left>Task {{ popup_edit && popup_edit.id.replace('C', '#') }} will run every time Task #<input type="number" name="runhook" min="0" max="1000"/> succeeds.</label>
      <label row center left>Task {{ popup_edit && popup_edit.id.replace('C', '#') }} will run on schedule at: <input type="text" name="schedule" @focus="!$event.target.value && ($event.target.value = 'R/' + new Date().iso().slice(0, 13) + ':00/PT24H')" pattern="^R[0-9]*\/[0-9]{4}-[0-9]{2}-[0-9]{2}T.*" /></label>
      <label row center left>If Task {{ popup_edit && popup_edit.id.replace('C', '#') }} succeeds, run: <input type="text" name="onsuccess" @input="$event.target.setCustomValidity('')" /></label>
      <label row center left>If Task {{ popup_edit && popup_edit.id.replace('C', '#') }} fails, run: <input type="text" name="onerror" @input="$event.target.setCustomValidity('')" /></label>
      <button type="submit">SAVE</button>
    </form>
  </drawer>
  <drawer @close="popup_logs = null" :openned="!!popup_logs">
    <section class="cmd logs" column @submit.prevent="logs(popup_logs.id, $event.target)" v-if="popup_logs">
      <h3>Task {{ popup_logs.id.replace('C', '#') }} - Logs</h3>
      <div column class="log-info">
        <div>Command: {{ popup_logs.command }}</div>
        <div>Total Runs: {{ ((popup_logs.runs || []) || []).length }}</div>
        <div row>
          <input type="text" name="search" placeholder="Search" v-model="search_logs" />
          <button @click="output = !output">Toggle outputs</button>
        </div>
      </div>
      <div column class="log-line" v-for="(run, index) in (popup_logs.runs || []).map(d => d).reverse()" :key="index" v-if="!search_logs || new RegExp(search_logs, 'i').test((run.error ? '✗' : '✓') + ' - Run ' + ((popup_logs.runs || []).length - index) + ' - Start At: ' + run.start.slice(0, 16) + ' - Duration: ' + run.duration.duration())">
        <div>
          <span class="status" :class="run.error ? 'negative' : 'positive'">{{ run.error ? '✗' : '✓' }}</span> - Run {{ (popup_logs.runs || []).length - index }} - Start At: {{ run.start.slice(0, 16) }} - Duration: {{ run.duration.duration() }}
        </div>
        <div v-if="output">
          <pre class="stdout">{{ run.stdout }}</pre>
          <pre class="stderr">{{ run.stderr || run.code }}</pre>
        </div>
      </div>
    </section>
  </drawer>
  <drawer class="login" @close="login_edit = null" :openned="!local && !!login_edit">
    <form @submit.prevent="login" column center v-if="!challenge_type">
      <fieldset>
        <label for="email" row center left>Email:</label>
        <input id="email" type="text" name="email" required />
      </fieldset>
      <fieldset>
        <label for="password" row center left>Password:</label>
        <input id="password" type="password" name="password" required />
      </fieldset>
      <button type="submit">LOGIN</button>
    </form>
    <form @submit.prevent="mfa" column center v-if="challenge_type">
      <fieldset>
        <label row center left>Google authenticator or SMS code:</label>
        <input name="google" required />
      </fieldset>
      <button type="submit">LOGIN</button>
    </form>
  </drawer>
</main>
</template>

<script>
import axios from 'axios'
import Sugar from 'sugar'
import auth0 from 'auth0-js'
import Drawer from './Drawer.vue'
import Frame from './Frame.vue'
import Kpi from './Kpi.vue'
import Timer from './Timer.vue'
Sugar.Object.defineInstance({ k: Sugar.Object.keys, v: Sugar.Object.values })
Sugar.Date.extend()
Sugar.Function.extend()
Sugar.Number.extend()
Sugar.String.extend()
Sugar.Array.extend()
Sugar.Object.extend({ objectPrototype: true, methods: ['filter', 'find', 'k', 'v', 'map', 'reduce'] })
const API = 'api/'
const AUTH0_DOMAIN = 'voltrade.auth0.com'
const AUTH0_CLIENT_ID = 'PlYPp7dw0ijYcU0JCs7r7BbxlT7qVh4c'
const webAuth = new auth0.WebAuth({ domain: AUTH0_DOMAIN, clientID: AUTH0_CLIENT_ID })
// webAuth.crossOriginVerification()

axios.interceptors.request.use(config => {
  config.params = {
    auth0_token: localStorage.id_token,
  }
  return config
})

export default {
  components: { Drawer, Frame, Kpi, Timer },
  data() {
    this.list()
    return {
      day: new Date().iso().slice(0, 10),
      counter: 0,
      commands: {},
      machine: null,
      notify: null,
      popup_edit: null,
      login_edit: !localStorage.id_token,
      popup_logs: null,
      sort: 'id',
      desc: true,
      search: null,
      search_logs: null,
      mfa_token: false,
      challenge_type: '',
      output: false,
      onerror: true,
      onsuccess: true,
      command: true,
    }
  },
  computed: {
    mobile() {
      return window.screen.width < 1000
    },
    local() {
      return location.hostname === '127.0.0.1' && !this.mobile
    },
    nextcmd() {
      return (
        this.commands
          .v()
          .filter(d => d.nextrun)
          .min(d => d.nextrun) || {}
      )
    },
    running() {
      return (
        this.commands
          .v()
          .filter(d => d.run)
          .map('command')
          .join(' - ') || '-'
      )
    },
    runs() {
      return this.commands
        .v()
        .map('runs')
        .filter(d => d)
        .flatten()
        .filter(d => !d.error).length
    },
    errors() {
      return this.commands
        .v()
        .map('runs')
        .filter(d => d)
        .flatten()
        .filter(d => d.error).length
    },
    days() {
      return this.commands
        .v()
        .map('runs')
        .filter(d => d)
        .flatten()
        .groupBy(d => d.start.slice(0, 10))
    },
  },
  methods: {
    list() {
      axios.get(API).then(res => {
        this.counter = res.data.counter
        this.commands = res.data.commands
        this.machine = res.data.machine
        this.notify = res.data.notify
      })
    },
    reset() {
      this.list()
      this.popup_edit = null
    },
    add(form) {
      axios
        .post(API, { command: form.command.value })
        .then(this.reset)
        .then(() => (form.command.value = ''))
    },
    edit(id, form) {
      const data = {
        command: form.command.value,
        schedule: form.schedule.value,
        runhook: 'C' + form.runhook.value,
        onsuccess: form.onsuccess.value,
        onerror: form.onerror.value,
      }
      axios
        .put(API + id, data)
        .then(d => {
          this.reset()
        })
        .catch(e => {
          console.log(e.response.data)
          if (!e.response.data.command) {
            document.querySelector('form.edit input[name="command"]').setCustomValidity('Please enter a valid command')
            document.querySelector('form.edit input[name="command"]').reportValidity()
          }
          if (!e.response.data.onsuccess) {
            document.querySelector('input[name="onsuccess"]').setCustomValidity('Please enter a valid command')
            document.querySelector('input[name="onsuccess"]').reportValidity()
          }
          if (!e.response.data.onerror) {
            document.querySelector('input[name="onerror"]').setCustomValidity('Please enter a valid command')
            document.querySelector('input[name="onerror"]').reportValidity()
          }
        })
    },
    login($event) {
      webAuth.client.login(
        {
          realm: 'Username-Password-Authentication',
          username: $event.target.elements.email.value,
          password: $event.target.elements.password.value,
        },
        (err, result) => {
          if (err) {
            if (err.code == 'mfa_required') {
              this.mfa_token = err.original.response.body.mfa_token
              axios.post('https://' + AUTH0_DOMAIN + '/mfa/challenge', { client_id: AUTH0_CLIENT_ID, mfa_token: this.mfa_token }).then(d => {
                this.challenge_type = d.data.challenge_type
                this.oob_code = d.data.oob_code
              })
              return
            }
            return
          }
          localStorage.setItem('id_token', result.idToken)
          this.login_edit = null
        },
      )
    },
    mfa($event) {
      const payload = {
        client_id: AUTH0_CLIENT_ID,
        grant_type: 'http://auth0.com/oauth/grant-type/mfa-' + this.challenge_type,
        mfa_token: this.mfa_token,
      }
      if (this.challenge_type === 'oob') {
        payload.oob_code = this.oob_code
        payload.binding_code = $event.target.elements.google.value
      }
      if (this.challenge_type === 'otp') payload.otp = $event.target.elements.google.value

      axios.post('https://' + AUTH0_DOMAIN + '/oauth/token', payload).then(d => {
        if (d.data.id_token) {
          localStorage.setItem('id_token', d.data.id_token)
          this.login_edit = null
        }
      })
    },
    logout() {
      localStorage.clear()
      setTimeout(() => location.reload(), 0)
    },
    run(id) {
      axios.get(API + id + '/run').then(this.reset)
    },
    skip(id) {
      axios.get(API + id + '/skip').then(this.reset)
    },
    kill(id) {
      axios.get(API + id + '/kill').then(this.reset)
    },
    del(id) {
      confirm('Delete ' + this.commands[id].command + '?') && axios.delete(API + id).then(this.reset)
    },
    nexttime(cmd) {
      if (!cmd.nextrun) return ' '
      const next = new Date(cmd.nextrun)
      if (next.isToday()) return 'Today ' + next.format('%X')
      if (next.isTomorrow()) return 'Tomorrow ' + next.format('%X')
      return next.relative()
    },
    simplify(cmd) {
      if (!/(\\|\/)/.test(cmd)) return cmd
      return cmd
        .replace(/['"]/g, '')
        .split(' ')
        .last()
        .split(/(\\|\/)/)
        .last()
    },
    prev() {
      this.day = new Date(this.day)
        .rewind('1 day')
        .iso()
        .slice(0, 10)
    },
    next() {
      this.day = new Date(this.day)
        .advance('1 day')
        .iso()
        .slice(0, 10)
    },
    cells(command) {
      if (!command.runs || this.day > new Date().iso().slice(0, 10)) return (0).upto(12).map(i => ({}))
      const runs = command.runs.filter(d => d.start.slice(0, 10) === this.day)
      return (0).upto(12).map(i => ({
        positive: runs.filter(d => !d.error && Math.trunc(d.start.slice(11, 13) / 2) === i).length,
        negative: runs.filter(d => d.error && Math.trunc(d.start.slice(11, 13) / 2) === i).length,
        running: command.run && Math.trunc(new Date().iso().slice(11, 13) / 2) === i,
      }))
    },
  },
  watch: {
    popup_edit() {
      const cmd = this.popup_edit || {}
      document.querySelector('form.edit input[name="command"]').value = cmd.command
      document.querySelector('input[name="schedule"]').value = cmd.schedule || ''
      document.querySelector('input[name="runhook"]').value = (cmd.runhook || '').slice(1)
      document.querySelector('input[name="onsuccess"]').value = cmd.onsuccess || ''
      document.querySelector('input[name="onerror"]').value = cmd.onerror || ''
    },
  },
  mounted() {
    setInterval(() => {
      if (!this.running.length) return
      if (!this.local && !localStorage.id_token) return
      this.list()
    }, 1000)
  },
}
</script>
