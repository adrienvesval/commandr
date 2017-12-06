<style>
@import '//rawcss.com/raw.css';
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
@media (max-width: 1000px) {
  form, .day:not(:last-child) { display: none!important; }
}
[grid] > * { background: var(--background);box-shadow: var(--box-shadow); }
.kpi, .kpi-timer { min-width: 300px!important;min-height: 80px; }

.table-list { background: var(--background);box-shadow: var(--box-shadow);overflow: auto; }
[name="command"] { width: 180px; }
[name="hours"] { width: 40px; }
input::-webkit-clear-button { -webkit-appearance: none;margin: 0; }
label { display: flex;margin: 0 8px; }
label input { margin: 0 4px; }
[xs] { font-size: 9px; }

.cmd { position: relative; }
.cmd [tt] { position: inherit; }
.cmd.new { padding: 10px; }
.cmd.header { background: #e0eaff;font-weight: 700; }
.cmd.header > * { padding: 10px; }
.cmd.item:nth-child(odd) { background: rgba(0, 0, 0, .03); }
.cmd.item:hover { background: rgba(0, 0, 0, .08); }
.cmd.item > * { padding: 10px;line-height: 1.2; }
.cmd > * { min-height: 100%; }
.cmd .name { width: 200px;font-weight: 700; }
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
        <span style="font-weight: 700;font-size: 18px;line-height: 18px;">{{ next.command }}</span>
      </span>
      <timer :time="next.nextrun" @time="list"></timer>
    </div>
  </section>
  <section>
    <div class="table-list">
      <form class="cmd new" row @submit.prevent="add($event.target)">
        <input type="text" name="command" placeholder="Command" required></input>
        <label>Every<input type="number" name="hours" min="1"></input>(H)</label>
        <label>At<input type="time" name="start" value="00:00"></input>(HH:MM)</label>
        <button>ADD</button>
      </form>
      <div class="cmd header" row>
        <div class="name" f1>Command</div>
        <div class="day" row center v-for="runs, day in days">
          {{ day }}
        </div>
      </div>
      <div class="cmd item" row v-for="command in commands">
        <div class="name" f1 column center left>
          <span>{{ command.command }}</span>
          <div>
            <span xs v-if="command.nextrun">{{ command.nextrun.slice(0, 16).replace('T', ' at ') }}</span>
            <button @click="run(command.id)">RUN</button>
            <button @click="del(command.id)">DEL</button>
          </div>
        </div>
        <div class="day" row center v-for="runs, day in days">
          <div class="cells" column v-for="hours_x2 in 12">
            <div class="cell" :class="day === new Date().iso().slice(0, 10) && hours_x2 * 2 > new Date().iso().slice(11, 13) && 'future'" v-if="!command.runs || command.runs.intersect(runs).filter(d => Math.trunc(d.start.slice(11, 13) / 2) === hours_x2).length === 0"></div>
            <div class="cell" :class="run.stderr || run.err ? 'negative' : 'positive'" :tt="JSON.stringify(run)" v-for="run in command.runs.intersect(runs).filter(d => Math.trunc(d.start.slice(11, 13) / 2) === hours_x2)" v-else></div>
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
const API = '//127.0.0.1:1337/127.0.0.1:1111/api/'

export default {
  components: { Kpi, Timer },
  data() {
    this.list()
    return {
      commands: {},
      machine: null,
      notify: null,
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
      return this.commands.values().map('runs').filter(d => d).flatten().filter(d => !d.err && !d.stderr).length
    },
    errors() {
      return this.commands.values().map('runs').filter(d => d).flatten().filter(d => d.err || d.stderr).length
    },
    days() {
      return this.commands.values().map('runs').filter(d => d).flatten().groupBy(d => d.start.slice(0, 10))
    },
  },
  methods: {
    list() {
      axios.get(API).then(res => {
        this.commands = res.data.commands
        this.machine = res.data.machine
        this.notify = res.data.notify
      })
    },
    add(form) {
      const data = {
        command: form.command.value,
        schedule: form.hours.value && ['R', new Date(new Date().iso().slice(0, 11) + form.start.value).iso().replace(/\.\d{3}/, ''), 'PT' + form.hours.value + 'H'].join('/'),
      }
      axios.post(API, data).then(this.list)
    },
    run(id) {
      axios.get(API + id + '/run').then(this.list)
    },
    skip(id) {
      axios.get(API + id + '/skip').then(this.list)
    },
    del(id) {
      confirm('Delete ' + this.commands[id].command + '?') && axios.delete(API + id).then(this.list)
    },
  },
  mounted() {
    setInterval(() => {
      if (!this.running.length) return
      this.list()
    }, 1000)
  }
}
</script>
