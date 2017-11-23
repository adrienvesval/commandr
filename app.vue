<style>
@import 'https://rawcss.com/raw.css';
@import url('https://fonts.googleapis.com/css?family=Lato:100,300,400,900');
html { font-family: Lato; }
body { font-size: 1.4rem; }
h1 { font-size: 2em;line-height: 1.33;text-align: center; }
em { font-style: normal;color: var(--primary); }
.running { background: var(--highlight); }
@media (min-width: 1000px){
  section, header, footer { max-width: 900px; }
  body { font-size: 1.6rem; }
  h1 { font-size: 3em; }
}
</style>

<template>
<main>
  <section>
    <h1 v-html="t.project"></h1>
  </section>
  <section>
    <form @submit.prevent="add($event.target)">
      <label>
        {{ t.command }}
        <input type="text" name="command"></input>
      </label>
      <label>
        {{ t.schedule }}
        {{ t.at }} <input type="time" name="start" value="00:00"></input>
        {{ t.every }} <input type="number" name="hours" value="24"></input> {{ t.hours }}
      </label>
      <button>{{ t.add }}</button>
    </form>
  </section>
  <section>
    <div># of Cmd: {{ commands.values().length }}</div>
    <div># of Cmd Running: {{ running }}</div>
    <div><span>Next Run in: </span><timer :time="nextrun" @time="list"></timer></div>
  </section>
  <section>
    <ul>
      <li v-for="command in commands" :class="{ running: command.run }">
        <span>{{ command.id }} | {{ command.command }}</span>
        <button @click="run(command.id)">{{ t.run }}</button>
        <button @click="del(command.id)">{{ t.del }}</button>
        <span v-if="command.run">{{ t.running }}: <timer :time="command.run.start"></timer></span>
        <span v-if="command.nextrun">{{ t.nextrun }}: <timer :time="command.nextrun"></timer></span>
        <ul v-for="run in command.runs">
          <li>{{ run }}</li>
        </ul>
      </li>
    </ul>
  </section>
</main>
</template>

<script>
import axios from 'axios'
import Sugar from 'sugar'
import Timer from './Timer.vue'
Sugar.extend({ objectPrototype: true })
// const API = '/api/'
const API = '//127.0.0.1:1337/127.0.0.1:1111/api/'

export default {
  components: { Timer },
  data() {
    this.list()
    return {
      commands: {},
      lang: 'en',
      translation: {
        en: {
          project: "<em>Command</em> schedule<em>R</em>",
          id: "ID",
          command: "Command",
          schedule: "Schedule",
          at: "AT",
          every: "EVERY",
          hours: "HOURS",
          running: "Running Since",
          nextrun: "Next Run in",
          add: "ADD",
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
    nextrun() {
      return this.commands.values().map('nextrun').filter(d => d).min()
    },
    running() {
      return this.commands.reduce((acc, v) => acc + !!v.run, 0)
    },
  },
  methods: {
    list() {
      axios.get(API).then(res => this.commands = res.data)
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
      axios.delete(API + id).then(this.list)
    },
  },
  mounted() {
    setInterval(() => {
      if (!this.running) return
      this.list()
    }, 1000)
  }
}
</script>
