<style>
.unit {
  opacity: 0.5;
  margin-left: -0.2em;
}

.unit:empty {
  display: none;
}

.positive {
  color: #63c261;
}

.negative {
  color: #db2e65;
}

.kpi,
.kpi > div {
  display: flex;
  flex-direction: row !important;
  flex-wrap: wrap !important;
}

.kpi {
  min-width: 200px;
  height: 80px;
  padding: 15px;
  font-weight: 400;
  line-height: 1;
}

.kpi > div {
  margin: auto;
}

.kpi .title {
  flex: 1;
}

.kpi-1 > div > * {
  min-width: 100%;
  text-align: center;
}

.kpi-1 .title {
  color: var(--primary);
  margin-bottom: 5px;
}

.kpi-1 .value {
  font-size: 160%;
}

.kpi-2 > div {
  min-width: 100%;
}

.kpi-2 > div:first-child {
  font-size: 160%;
  color: var(--primary);
}

.kpi-2 > div:nth-child(n + 2) {
  color: #bbb;
}

.kpi-3 > div:first-child {
  min-width: 100%;
}

.kpi-3 > div:first-child {
  font-size: 160%;
}

.kpi-3 > div:nth-child(2) {
  flex: 1;
}

.kpi-3 > div:nth-child(n + 2) {
  width: 50px;
  font-size: 10px;
  text-transform: uppercase;
}

.kpi-3 > div:nth-child(n + 3) > * {
  width: 50px;
  text-align: right;
}

.kpi-3 > div:nth-child(n + 2) .title {
  min-width: 100%;
  color: #bbb;
}
</style>

<template>
<div class="kpi" :class="'kpi-' + Math.min(3, data.length)">
  <div v-for="kpi in data" :key="kpi[0]">
    <div class="title">{{ kpi[0] }}</div>
    <div class="value" :class="kpi[2]">
      <span class="number">{{ split(kpi[1]).number }}</span>
      <span class="unit">{{ split(kpi[1]).unit }}</span>
    </div>
  </div>
</div>
</template>

<script>
export default {
  props: ['data'],
  methods: {
    split(raw) {
      if (typeof raw !== 'string') return { number: raw, unit: '' }
      let number = raw.replace(/^([\d.+-]+)(.*)/, '$1')
      let unit = raw.replace(/^([\d.+-]+)(.*)/, '$2')
      if (number === unit) unit = ''
      return { number, unit }
    },
  },
}
</script>
