<style>
@import url('https://rawcss.com/raw.css');
@import url('https://fonts.googleapis.com/css?family=Lato:100,300,400,900');
:root {
  --background-1: #f1f4f9;
  --box-shadow: 0 3px 10.5px 0 rgba(74, 105, 160, 0.16);
}
html {
  font-family: Lato;
}
body {
  background: var(--background-1);
}
h1 {
  height: 60px;
  line-height: 60px;
  font-size: 18px;
  text-transform: uppercase;
  text-align: center;
  border-bottom: var(--border);
  background: var(--background);
}
section {
  padding: 0;
  margin: 20px !important;
  max-width: calc(100% - 40px);
}
em {
  font-style: normal;
  color: var(--primary);
}
pre {
  position: relative;
  padding: 10px;
  border: 3px dashed var(--divider);
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
@media (min-width: 1000px) {
  section,
  header,
  footer {
    margin: 20px auto !important;
  }
  body {
    font-size: 16px;
  }
}
[grid] > * {
  background: var(--background);
  box-shadow: var(--box-shadow);
}
.kpi,
.kpi-timer {
  min-width: 300px !important;
  min-height: 80px;
}

.table-list {
  background: var(--background);
  box-shadow: var(--box-shadow);
  overflow: auto;
}
hr {
  margin: 10px 60px;
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
  width: 20px;
  margin: 0 2px 0 0;
}
input[name='search'] {
  margin-left: auto;
}
input::-webkit-clear-button {
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
  padding: 10px;
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
.day {
  margin: 0 4px;
  min-width: 175px;
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
</style>

<template>
<main>
  <h1>Command Scheduler</h1>
  <section grid>
    <kpi :data="[['Machine', machine], ['Notify', notify], ['Cmds', commands.values().length], ['Runs', runs], ['Errors', errors]]" />
    <div class="kpi-timer" row center around>
      <span column>
        <span>Next Run</span>
        <span style="font-weight: 700;font-size: 18px;line-height: 18px;">{{ nextcmd.command && nextcmd.id.replace('C', '#') + ': ' + simplify(nextcmd.command) }}</span>
      </span>
      <timer :time="nextcmd.nextrun" @time="list"></timer>
    </div>
  </section>
  <section>
    <div class="table-list">
      <form class="cmd new" row @submit.prevent="add($event.target)">
        <input type="text" name="id" :value="'#' + (counter + 1)" disabled />
        <input type="text" name="command" placeholder="Command" required />
        <button>ADD</button>
        <input left type="text" name="search" placeholder="Search" v-model="search" />
      </form>
      <div class="cmd header" row>
        <div>ID</div>
        <div f1>Command</div>
        <div class="day" row center>
          <button @click="prev">&lt;</button>
          {{ day }}
          <button @click="next">&gt;</button>
        </div>
      </div>
      <div class="cmd item" row v-for="command in commands" :key="command.id" v-if="!search || search === command.id || new RegExp(search, 'i').test(command.command)">
        <div row center>{{ command.id.replace('C', '#') }}</div>
        <div f1 row center left tt="Click to Edit" @click="popup_edit = command">{{ command.command }}</div>
        <div row center><span v-if="command.nextrun">{{ nexttime(command) }}</span></div>
        <div row center>
          <button @click="del(command.id)">DEL</button>
          <button @click="kill(command.id)" v-if="command.run">KILL</button>
          <button @click="run(command.id)" v-if="!command.run">RUN</button>
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
      <label row center>Command: <input full type="text" name="command" required /></label>
      <hr>
      <label row center left>Task {{ popup_edit && popup_edit.id.replace('C', '#') }} will run every time Task #<input type="text" name="runhook" /> succeeds.</label>
      <hr>
      <label row center left>Task {{ popup_edit && popup_edit.id.replace('C', '#') }} will run on schedule at: <input type="text" name="schedule" @focus="!$event.target.value && ($event.target.value = 'R/' + new Date().iso().slice(0, 13) + ':00/PT24H')" /></label>
      <hr>
      <label row center left>If Task {{ popup_edit && popup_edit.id.replace('C', '#') }} succeeds, run: <input type="text" name="onsuccess" /></label>
      <hr>
      <label row center left>If Task {{ popup_edit && popup_edit.id.replace('C', '#') }} fails, run: <input type="text" name="onerror" /></label>
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
</main>
</template>

<script>
import axios from 'axios'
import Sugar from 'sugar'
import Drawer from './Drawer.vue'
import Frame from './Frame.vue'
import Kpi from './Kpi.vue'
import Timer from './Timer.vue'
Sugar.extend({ objectPrototype: true })
const API = 'api/'

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
      popup_logs: null,
      search: null,
      search_logs: null,
      output: false,
    }
  },
  computed: {
    nextcmd() {
      return (
        this.commands
          .values()
          .filter(d => d.nextrun)
          .min(d => d.nextrun) || {}
      )
    },
    running() {
      return (
        this.commands
          .values()
          .filter(d => d.run)
          .map('command')
          .join(' - ') || '-'
      )
    },
    runs() {
      return this.commands
        .values()
        .map('runs')
        .filter(d => d)
        .flatten()
        .filter(d => !d.error).length
    },
    errors() {
      return this.commands
        .values()
        .map('runs')
        .filter(d => d)
        .flatten()
        .filter(d => d.error).length
    },
    days() {
      return this.commands
        .values()
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
      axios.put(API + id, data).then(this.reset)
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
      const next = new Date(cmd.nextrun)
      if (next.isToday()) return 'Today at ' + next.format('%X')
      if (next.isTomorrow()) return 'Tomorrow at ' + next.format('%X')
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
      this.list()
    }, 1000)
  },
}
</script>
