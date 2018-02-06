<style>
@import url('https://rawcss.com/raw.css');
@import url('https://fonts.googleapis.com/css?family=Lato:100,300,400,900');
.hack {}
:root { --background-1: #f1f4f9;--box-shadow: 0 3px 10.5px 0 rgba(74, 105, 160, 0.16); }
html { font-family: Lato; }
body { font-size: 1.4rem;background: var(--background-1); }
h1 { height: 60px;line-height: 60px;font-size: 18px;text-transform: uppercase;text-align: center;border-bottom: var(--border);background: var(--background); }
section { padding: 0;margin: 2rem!important;max-width: calc(100% - 4rem); }
em { font-style: normal;color: var(--primary); }
@media (min-width: 1000px) {
  section, header, footer { margin: 2rem auto!important; }
  body { font-size: 1.6rem; }
}
[grid] > * { background: var(--background);box-shadow: var(--box-shadow); }
.kpi, .kpi-timer { min-width: 300px!important;min-height: 80px; }

.table-list { background: var(--background);box-shadow: var(--box-shadow);overflow: auto; }
hr { margin: 1rem 60px; }
input { width: 180px; }
input:hover, input:focus { outline: 1px solid #fd4;outline-offset: -1px; }
input:disabled { outline: none; }
[name="id"] { width: 30px; }
[name="runhook"] { width: 20px;margin: 0 2px 0 0; }
input::-webkit-clear-button { -webkit-appearance: none;margin: 0; }
label, input { display: inline-block; }
label { margin: 0 4px; }
label input { margin: 0 2px; }
[xs] { font-size: 9px; }

.drawer .slot {padding: 20px; }
.drawer h3 { text-align: center;margin: 20px; }
.drawer button { margin: 5px 20px 0 auto; }

.header .day { position: relative; }
.header .day button { position: absolute;top: 0;height: 100%;background: none;border: none;cursor: pointer; }
.header .day button:first-child { left: 0; }
.header .day button:last-child { right: 0; }

.cmd { position: relative; }
.cmd [tt] { position: inherit; }
.cmd.new { padding: 10px; }
.cmd.highlight { background: var(--highlight)!important; }
.cmd.header { background: #e0eaff;font-weight: 700; }
.cmd.header > * { padding: 10px; }
.cmd.item:nth-child(odd) { background: rgba(0, 0, 0, .03); }
.cmd.item:hover { background: rgba(0, 0, 0, .08); }
.cmd.item > * { padding: 10px;line-height: 1.2; }
.cmd > * { min-height: 100%; }
.cmd .name { min-width: 200px;font-weight: 700; }
.cmd .name > div:first-child { display: flex;width: 100%; }
.cmd .name > div:first-child > span:first-child { margin-right: auto; }
.cmd .action { width: 60px; }
.day { margin: 0 4px;min-width: 160px; }
.cell { margin: 1px;width: 10px;height: 10px;background: #606a7f; }
.cell.future { background: #b0bacf; }
.cell.running { background: #fd4; }
.cell.positive { background: #63c261; }
.cell.negative { background: #db2e65; }
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
        <input type="text" name="id" :value="'#' + (counter + 1)" disabled></input>
        <input type="text" name="command" placeholder="Command" required></input>
        <button>ADD</button>
      </form>
      <div class="cmd header" row>
        <div>ID</div>
        <div f1>Command</div>
        <div class="day" row center>
          <button @click="prev"><</button>
          {{ day }}
          <button @click="next">></button>
        </div>
      </div>
      <div class="cmd item" row v-for="command in commands">
        <div row center>{{ command.id.replace('C', '#') }}</div>
        <div f1 row center left tt="Click to Edit" @click="popup_edit = command">{{ command.command }}</div>
        <div row center><span v-if="command.nextrun">{{ nexttime(command) }}</span></div>
        <div row center>
          <button @click="del(command.id)">DEL</button>
          <button @click="kill(command.id)" v-if="command.run">KILL</button>
          <button @click="run(command.id)" v-if="!command.run">RUN</button>
        </div>
        <div class="day" row center tt="Click to See Logs" @click="popup_logs = command">
          <div class="cells" column v-for="hours_x2 in 12">
            <div class="cell" :class="(day > new Date().iso().slice(0, 10) || (day === new Date().iso().slice(0, 10) && hours_x2 * 2 > new Date().iso().slice(11, 13))) && 'future'" v-if="!command.runs || command.runs.filter(d => d.start.slice(0, 10) === day && Math.trunc(d.start.slice(11, 13) / 2) === hours_x2).length === 0"></div>
            <div class="cell" :class="run.error ? 'negative' : 'positive'" v-for="run in command.runs.filter(d => d.start.slice(0, 10) === day && Math.trunc(d.start.slice(11, 13) / 2) === hours_x2)" v-else></div>
            <div class="cell running" v-if="command.run && command.run.start.slice(0, 10) === day && Math.trunc(command.run.start.slice(11, 13) / 2) === hours_x2"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <drawer @close="popup_edit = null" :openned="!!popup_edit">
    <form class="cmd edit" column @submit.prevent="edit(popup_edit.id, $event.target)">
      <h3>Task {{ popup_edit && popup_edit.id.replace('C', '#') }} - Edit</h3>
      <label>Command: <input type="text" name="command" required></input></label>
      <hr>
      <label>Task {{ popup_edit && popup_edit.id.replace('C', '#') }} will run every time Task #<input type="text" name="runhook"></input> succeeds.</label>
      <hr>
      <label>Task {{ popup_edit && popup_edit.id.replace('C', '#') }} will run on schedule at: <input type="text" name="schedule" @focus="!$event.target.value && ($event.target.value = 'R/' + new Date().iso().slice(0, 13) + ':00/PT24H')"></input></label>
      <hr>
      <label>If Task {{ popup_edit && popup_edit.id.replace('C', '#') }} succeeds, run: <input type="text" name="onsuccess"></input></label>
      <hr>
      <label>If Task {{ popup_edit && popup_edit.id.replace('C', '#') }} fails, run: <input type="text" name="onerror"></input></label>
      <button>SAVE</button>
    </form>
  </drawer>
  <drawer @close="popup_logs = null" :openned="!!popup_logs">
    <form class="cmd logs" column @submit.prevent="logs(popup_logs.id, $event.target)">
      <h3>Task {{ popup_logs && popup_logs.id.replace('C', '#') }} - Logs</h3>
      <div v-for="run, index in popup_logs && popup_logs.runs">
        {{ run.error ? '✗' : '✓' }} - {{ (index + 1).ordinalize() }} run started at {{ run.start.slice(0, 16) }} for {{ run.duration.duration() }} with output {{ run.stdout || run.stderr || run.err || 'null' }}.
      </div>
    </form>
  </drawer>
</main>
</template>

<script>
import axios from 'axios'
import Sugar from 'sugar'
import Drawer from './Drawer.vue'
import Kpi from './Kpi.vue'
import Timer from './Timer.vue'
Sugar.extend({ objectPrototype: true })
const API = 'api/'

export default {
  components: { Drawer, Kpi, Timer },
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
    }
  },
  computed: {
    nextcmd() {
      return this.commands.values().filter(d => d.nextrun).min(d => d.nextrun) || {}
    },
    running() {
      return this.commands.values().filter(d => d.run).map('command').join(' - ') || '-'
    },
    runs() {
      return this.commands.values().map('runs').filter(d => d).flatten().filter(d => !d.error).length
    },
    errors() {
      return this.commands.values().map('runs').filter(d => d).flatten().filter(d => d.error).length
    },
    days() {
      return this.commands.values().map('runs').filter(d => d).flatten().groupBy(d => d.start.slice(0, 10))
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
      axios.post(API, { command: form.command.value }).then(this.reset).then(() => form.command.value = '')
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
      return cmd.replace(/['"]/g, '').split(' ').last().split(/(\\|\/)/).last()
    },
    prev() {
      this.day = new Date(this.day).rewind('1 day').iso().slice(0, 10)
    },
    next() {
      this.day = new Date(this.day).advance('1 day').iso().slice(0, 10)
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
    }
  },
  mounted() {
    setInterval(() => {
      if (!this.running.length) return
      this.list()
    }, 1000)
  }
}
</script>
