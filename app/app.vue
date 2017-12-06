<style>
@import '//rawcss.com/raw.css';
@import url('https://fonts.googleapis.com/css?family=Lato:100,300,400,900');
.hack {}
:root { --background-1: #f1f4f9;--box-shadow: 0 3px 10.5px 0 rgba(74, 105, 160, 0.16);--transition: all .3s cubic-bezier(.4, .0, .2, 1); }
html { font-family: Lato; }
body { font-size: 1.4rem;background: var(--background-1); }
h1 { height: 60px;line-height: 60px;font-size: 18px;text-transform: uppercase;text-align: center;border-bottom: var(--border);background: var(--background); }
em { font-style: normal;color: var(--primary); }
.running { background: var(--highlight); }
@media (min-width: 1000px) {
  section, header, footer { max-width: 100%;width: auto; }
  body { font-size: 1.6rem; }
}
[grid] > * { background: var(--background);box-shadow: var(--box-shadow); }
form { padding: 10px 20px;border-top: var(--border);border-bottom: var(--border);transition: var(--transition); }
[name="command"] { width: 180px;margin-left: 18px; }
[name="hours"] { width: 40px; }
[name="email"] { width: 180px;margin-left: 38px; }
[name="onsuccess"] { width: 180px; }
main > button { margin-left: 20px; }
form button { width: 100px;margin-left: 84px; }
.kpi, .kpi-timer { min-width: 300px!important; }

.cmd { overflow: auto;margin: 10px 0;background: var(--background);box-shadow: var(--box-shadow); }
.cmd > * { min-height: 100%; }
.cmd .name { width: 100px; }
.cmd .action { width: 60px; }
.day { margin: 0 4px;min-width: 144px; }
.cell { margin: 1px;width: 10px;height: 10px;background: #606a7f; }
.cell.future { background: #b0bacf; }
.cell.running { background: #fd4; }
.cell.positive { background: #63c261; }
.cell.negative { background: #db2e65; }
</style>

<template>
<main>
  <h1 v-html="t.project"></h1>
  <section grid>
    <kpi :data="[['Commands', commands.values().length], ['Running', running.map('command').join(' - ')], ['Runs', runs], ['Errors', errors]]" />
    <div class="kpi-timer" row center around>
      <span column>
        <span>{{ t.nextcmd }}</span>
        <span style="font-weight: 700;font-size: 18px;line-height: 18px;">{{ next.command }}</span>
      </span>
      <timer :time="next.nextrun" @time="list"></timer>
    </div>
  </section>
  <button @click="show = !show" v-if="commands.values().length !== 0">{{ show ? 'HIDE' : 'SHOW' }} FORM</button>
  <form @submit.prevent="add($event.target)" v-if="commands.values().length === 0 || show">
    <label>*
      {{ t.command }}
      <input type="text" name="command" required></input>
    </label>
    <br>
    <label>
      {{ t.schedule }}
      {{ t.at }} <input type="time" name="start" value="00:00"></input>
    </label>
    <label>
      {{ t.every }} <input type="number" name="hours" min="1"></input> {{ t.hours }}
    </label>
    <br>
    <label>
      {{ t.email }} <input type="email" name="email" :value="commands.values().map('email').filter(x => x).most()"></input>
    </label>
    <br>
    <label>
      {{ t.onsuccess }} <select name="onsuccess">
        <option></option>
        <option :value="command.id" v-for="command in commands">{{ command.command }}</option>
      </select>
    </label>
    <br>
    <button>{{ t.add }}</button>
  </form>
  <section>
    <div class="cmd header" row>
      <span class="name">NAME</span>
      <span class="action">ACTION</span>
      <div class="day" row center v-for="runs, day in days">
        {{ day }}
      </div>
    </div>
    <div class="cmd" row v-for="command in commands">
      <span class="name" :tt="JSON.stringify(command)">{{ command.command }}</span>
      <button class="action" @click="run(command.id)">{{ t.run }}</button>
      <div class="day" row center v-for="runs, day in days">
        <!-- :tt="'Hours: ' + hours_x2 * 2"  -->
        <div class="cells" column v-for="hours_x2 in 12">
          <div class="cell" :class="day === new Date().iso().slice(0, 10) && hours_x2 * 2 > new Date().iso().slice(11, 13) && 'future'" v-if="!command.runs || command.runs.intersect(runs).filter(d => Math.trunc(d.start.slice(11, 13) / 2) === hours_x2).length === 0"></div>
          <div class="cell" :class="run.stderr || run.err ? 'negative' : 'positive'" :tt="JSON.stringify(run)" v-for="run in command.runs.intersect(runs).filter(d => Math.trunc(d.start.slice(11, 13) / 2) === hours_x2)" v-else></div>
          <div class="cell running" :tt="JSON.stringify(command.run)" v-if="command.run && command.run.start.slice(0, 10) === day && Math.trunc(command.run.start.slice(11, 13) / 2) === hours_x2"></div>
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
      show: false,
      lang: 'en',
      translation: {
        en: {
          project: "Command scheduler",
          nextcmd: "Next Command",
          id: "ID",
          command: "Command",
          schedule: "Schedule",
          at: "at",
          every: "Every",
          hours: "Hours",
          email: "Email",
          onsuccess: "On success",
          add: "SCHEDULE",
          run: "RUN",
          skip: "SKIP",
          del: "DELETE",
        }
      }
    }
  },
  computed: {
    t() {
      return this.translation[this.lang] || {}
    },
    next() {
      return this.commands.values().filter(d => d.nextrun).min(d => d.nextrun) || {}
    },
    running() {
      return this.commands.values().filter(d => d.run)
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
      axios.get(API).then(res => this.commands = res.data)
    },
    add(form) {
      this.show = false
      const data = {
        command: form.command.value,
        schedule: form.hours.value && ['R', new Date(new Date().iso().slice(0, 11) + form.start.value).iso().replace(/\.\d{3}/, ''), 'PT' + form.hours.value + 'H'].join('/'),
        email: form.email.value,
        onsuccess: form.onsuccess.value,
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
      confirm('Sure?') && axios.delete(API + id).then(this.list)
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
