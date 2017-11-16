<style>
@import 'https://rawcss.com/raw.css';
@import url('https://fonts.googleapis.com/css?family=Lato:100,300,400,900');
html { font-family: Lato; }
body { font-size: 1.4rem; }
h1 { font-size: 2em;line-height: 1.33;text-align: center; }
em { font-style: normal;color: var(--primary); }
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
    <form @submit.prevent="add($event.target)">
      <label>
        {{ t.id }}
        <input type="text" name="id"></input>
      </label>
      <label>
        {{ t.command }}
        <input type="text" name="command"></input>
      </label>
      <label>
        {{ t.schedule }}
        <input type="text" name="schedule"></input>
      </label>
      <button>{{ t.add }}</button>
    </form>
    <ul>
      <li v-for="command in commands">
        {{ command.id }} | {{ command.command }} | {{ command.schedule }}
        <button @click="del(command.id)">{{ t.del }}</button>
        <ul v-for="log in command.logs || 3">
          <li>LOG</li>
        </ul>
      </li>
    </ul>
  </section>
</main>
</template>

<script>
import axios from 'axios'
const API = '//127.0.0.1:1337/127.0.0.1:1111/api/'
window.axios = axios

export default {
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
          add: "ADD",
          del: "DELETE",
        }
      }
    }
  },
  computed: {
    t() {
      return this.translation[this.lang] || {}
    },
  },
  methods: {
    list() {
      axios.get(API)
        .then(res => this.commands = res.data)
    },
    add(form) {
      const data = Array.from(new FormData(form))
        .reduce((acc, v) => { acc[v[0]] = v[1];return acc }, {})
      axios.post(API, data)
        .then(this.list)
    },
    del(id) {
      axios.delete(API + id)
        .then(this.list)
    },
  }
}
</script>
