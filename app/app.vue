<style>
@import 'https://rawcss.com/raw.css';
@import url('https://fonts.googleapis.com/css?family=Lato:100,300,400,900');
.hack {}
:root { --background-1: #f1f4f9;--box-shadow: 0 3px 10.5px 0 rgba(74, 105, 160, 0.16);--transition: all .3s cubic-bezier(.4, .0, .2, 1); }
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
input { width: 180px; }
[name="id"] { width: 30px; }
[name="runhook"], [name="hours"] { width: 40px; }
input::-webkit-clear-button { -webkit-appearance: none;margin: 0; }
label { display: flex;margin: 0 8px; }
label input { margin: 0 4px; }
[xs] { font-size: 9px; }

.cmd { position: relative; }
.cmd [tt] { position: inherit; }
.cmd.new, .cmd.edit { padding: 10px; }
.cmd.highlight { background: var(--highlight); }
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
        <span style="font-weight: 700;font-size: 18px;line-height: 18px;">{{ next.command && next.command.replace(/['"]/g, '').split(' ').map(w => w.split(/(\\|\/)/).last()).join(' ') }}</span>
      </span>
      <timer :time="next.nextrun" @time="list"></timer>
    </div>
  </section>
  <section>
    <div class="table-list">
      <form class="cmd new" row @submit.prevent="add($event.target)">
        <input type="text" name="id" :value="'#' + (counter + 1)" disabled></input>
        <input type="text" name="command" placeholder="Command" required></input>
        <button>ADD</button>
      </form>
      <form class="cmd edit" @submit.prevent="edit(commands[highlight].id, $event.target)" v-show="highlight">
        <label>Run Every<input type="number" name="hours" min="1" @input="hours2schedule"></input>(H)</label>
        <label>Or Schedule<input type="text" name="schedule" placeholder="R[num]/[date]/PT[incr]"></input></label>
        <label>Run After<input type="text" name="runhook" placeholder="#1"></input></label>
        <label>On Success<input type="text" name="onsuccess" placeholder="Command ✓"></input></label>
        <label>On Error<input type="text" name="onerror" placeholder="Command ✗"></input></label>
        <button type="button" @click="del(commands[highlight].id)">DEL</button>
        <button>SAVE</button>
      </form>
      <div class="cmd header" row>
        <div>ID</div>
        <div f1>Command</div>
        <div class="day" row center>{{ day }}</div>
      </div>
      <div class="cmd item" :class="{ highlight: highlight === command.id }" row v-for="command in commands" @click="highlight = highlight === command.id ? null : command.id">
        <div>{{ command.id.replace('C', '#') }}</div>
        <div f1>{{ command.command.replace(/['"]/g, '').split(' ').map(w => w.split(/(\\|\/)/).last()).join(' ') }}</div>
        <div><span v-if="command.nextrun">{{ nexttime(command) }}</span></div>
        <div>
          <button @click="kill(command.id)" v-if="command.run">KILL</button>
          <button @click="run(command.id)">RUN</button>
        </div>
        <div class="day" row center>
          <div class="cells" column v-for="hours_x2 in 12">
            <div class="cell" :class="day === new Date().iso().slice(0, 10) && hours_x2 * 2 > new Date().iso().slice(11, 13) && 'future'" v-if="!command.runs || command.runs.filter(d => Math.trunc(d.start.slice(11, 13) / 2) === hours_x2).length === 0"></div>
            <div class="cell" :class="run.error ? 'negative' : 'positive'" :tt="JSON.stringify(run)" v-for="run in command.runs.filter(d => Math.trunc(d.start.slice(11, 13) / 2) === hours_x2)" v-else></div>
            <div class="cell running" :tt="JSON.stringify(command.run)" v-if="command.run && command.run.start.slice(0, 10) === day && Math.trunc(command.run.start.slice(11, 13) / 2) === hours_x2"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
</template>

<script>
import axios from 'axios'
import Sugar from 'sugar'
import Kpi from './Kpi.vue'
import Timer from './Timer.vue'
Sugar.extend({ objectPrototype: true })
const API = 'http://127.0.0.1:1337/127.0.0.1:1111/api/'

export default {
  components: { Kpi, Timer },
  data() {
    this.list()
    return {
      day: new Date().iso().slice(0, 10),
      counter: 0,
      commands: {},
      machine: null,
      notify: null,
      highlight: null,
    }
  },
  computed: {
    next() {
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
    reset() {
      this.list()
      this.highlight = false
    },
    list() {
      axios.get(API).then(res => {
        this.counter = res.data.counter
        this.commands = res.data.commands
        this.machine = res.data.machine
        this.notify = res.data.notify
      })
    },
    add(form) {
      axios.post(API, { command: form.command.value }).then(this.reset)
    },
    edit(id, form) {
      const data = {
        schedule: form.schedule.value,
        runhook: form.runhook.value.replace('#', 'C'),
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
      let day = cmd.nextrun.slice(0, 10)
      if (day === new Date().iso().slice(0, 10)) day = 'Today'
      if (day === new Date().advance('1 day').iso().slice(0, 10)) day = 'Tomorrow'
      return day + ' at ' + cmd.nextrun.slice(11, 16)
    },
    hours2schedule($event) {
      document.querySelector('input[name="schedule"]').value = 'R/' + new Date().iso().slice(0, 13) + ':00/PT' + $event.target.value + 'H'
    },
  },
  watch: {
    highlight() {
      const cmd = this.commands[this.highlight] || {}
      document.querySelector('input[name="hours"]').value = null
      document.querySelector('input[name="schedule"]').value = cmd.schedule || ''
      document.querySelector('input[name="runhook"]').value = (cmd.runhook || '').replace('C', '#')
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
