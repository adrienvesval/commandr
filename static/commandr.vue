<style>
@import 'https://rawcss.com/raw.css';
@import url('https://fonts.googleapis.com/css?family=Lato:100,300,400,900');
html { font-family: Lato; }
body { font-size: 1.4rem; }
h1 { font-size: 2em;line-height: 1.33;margin: 30px 0; }
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
  </section>
</main>
</template>

<script>
export default {
  data() {
    return {
      lang: 'en',
      translation: {
        en: {
          project: "CommandR<small><em> - Command scheduleR</em></small>",
        }
      }
    }
  },
  computed: {
    t() {
      return this.translation[this.lang] || {}
    },
  }
}
</script>
