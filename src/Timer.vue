<style>
.vue-timer {
  padding: 0;
  margin: 0;
}

.vue-timer li {
  display: inline-block;
  margin: 0 8px;
  text-align: center;
  position: relative;
}

.vue-timer li p {
  margin: 0;
}

.vue-timer li:after {
  content: ':';
  position: absolute;
  top: -8px;
  right: -13px;
  font-size: 32px;
}

.vue-timer li:first-of-type {
  margin-left: 0;
}

.vue-timer li:last-of-type {
  margin-right: 0;
}

.vue-timer li:last-of-type:after {
  content: '';
}

.vue-timer .digit {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 0;
}

.vue-timer .text {
  text-transform: uppercase;
  margin-bottom: 0;
  font-size: 10px;
}
</style>

<template>
<ul class="vue-timer">
  <li v-if="+days">
    <p class="digit">{{ days }}</p>
    <p class="text">days</p>
  </li>
  <li>
    <p class="digit">{{ hours }}</p>
    <p class="text">hours</p>
  </li>
  <li>
    <p class="digit">{{ minutes }}</p>
    <p class="text">Min</p>
  </li>
  <li>
    <p class="digit">{{ seconds }}</p>
    <p class="text">Sec</p>
  </li>
</ul>
</template>

<script>
export default {
  props: ['time'],
  data() {
    return {
      diff: 0,
    }
  },
  computed: {
    seconds() {
      return this.two(this.diff % 60)
    },
    minutes() {
      return this.two((this.diff / 60) % 60)
    },
    hours() {
      return this.two((this.diff / 60 / 60) % 24)
    },
    days() {
      return this.two(this.diff / 60 / 60 / 24)
    },
  },
  methods: {
    two(num) {
      if (!this.diff) return '--'
      num = Math.trunc(num)
      return num.toString().length <= 1 ? '0' + num : '' + num
    },
  },
  mounted() {
    setInterval(() => {
      if (!this.time) return (this.diff = 0)
      this.diff = Math.abs((new Date(this.time) - new Date()) / 1000)
      if (Math.trunc(this.diff) === 0) this.$emit('time')
    }, 1000)
  },
}
</script>
