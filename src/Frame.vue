<style>
.frame {
  padding: 0 !important;
  background: none !important;
  box-shadow: none !important;
  overflow: auto;
}
.frame > div {
  min-width: fit-content;
  background: var(--background);
  box-shadow: var(--box-shadow);
  margin: 2px auto;
}
.frame .lines {
  overflow-y: auto;
  font-size: 70%;
  font-weight: 500;
}
.frame .header {
  min-height: 50px;
  font-weight: 500;
  box-shadow: var(--box-shadow);
  background: rgba(255, 221, 0, 0.2);
}
.frame .search,
.frame .line {
  min-height: 35px;
}
.frame .line:hover .cell,
.frame .cell.highlight {
  background: rgba(255, 221, 0, 0.1);
}
.frame .line .cell.active {
  background: rgba(255, 221, 0, 0.4);
}
.frame .cell {
  min-width: 100px;
  max-width: 100px;
  padding: 5px 10px;
  white-space: nowrap;
  overflow: auto;
}
.frame .cell:hover {
  cursor: pointer;
  outline: 1px solid #fd4;
  outline-offset: -1px;
}
.frame .cell.sort {
  color: var(--primary);
  margin-left: 4px;
}
.frame .cell.sort.asc::after {
  content: '\25B3';
}
.frame .cell.sort.desc::after {
  content: '\25BD';
}
.frame input {
  margin: 0 !important;
  padding: 8px !important;
  padding-right: 0 !important;
}
.frame [name='limit'],
.frame [name='length'] {
  max-width: 50px;
}
.frame .cell:first-child {
  max-width: inherit;
  flex: 1;
  justify-content: flex-start;
}
.frame .more {
  position: absolute;
  height: 50px;
  padding: 12px;
  background: #fd4;
}
.frame .more.open {
  top: 52px;
}
.frame:not(.less) .header .cell:first-child {
  padding-left: 40px;
}
.frame.less .more {
  display: none;
}
.frame .cell {
  -ms-overflow-style: none;
}
.frame .cell {
  overflow: -moz-scrollbars-none;
}
.frame .cell::-webkit-scrollbar {
  display: none;
}
.frame .lines {
  -ms-overflow-style: none;
}
.frame .lines {
  overflow: -moz-scrollbars-none;
}
.frame .lines::-webkit-scrollbar {
  display: none;
}
</style>

<template>
<div class="frame" v-if="data">
  <div column>
    <div class="more" :class="{ open: more }" @click="more = !more">+</div>
    <div row class="search" v-if="more">
      <input name="search" type="text" v-model="search" placeholder="Search" v-focus />
      <input name="limit" type="number" v-model="limit" min="1" />
      <input name="length" type="text" :value="lines.length" disabled />
    </div>
    <div row class="header" v-if="metadata">
      <div row center left class="cell"
        :class="{ highlight: highlight === header, sort: sort === header, desc: desc, asc: !desc }"
        v-html="header" v-for="(format, header) in metadata" :key="header"
        @mouseover="highlight = header" @mouseout="highlight = null"
        @click="click(header)"></div>
    </div>
    <div class="lines">
      <div row class="line" v-for="(line, index) in lines" :key="index">
        <div row center left class="cell"
          :class="{ highlight: highlight === header }"
          v-html="format ? format(line) : line[header]" v-for="(format, header) in metadata" :key="header"
          @click="click(index)"></div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
// No router > active: Object.values(line).includes($route.query.line)
// No xtend > .values()
export default {
  props: ['data', 'metadata'],
  data() {
    return {
      search: null,
      limit: 50,
      highlight: null,
      sort: 0,
      desc: false,
      more: false,
    }
  },
  computed: {
    lines() {
      let data = this.data
      if (this.search) data = data.filter(d => d.some(v => new RegExp(this.search, 'i').test(v)))
      return data.sortBy(this.sort, this.desc).slice(0, this.limit)
    },
  },
  methods: {
    click(index, line) {
      if (!line) {
        this.desc = index === this.sort ? !this.desc : true
        this.sort = index
      }
      this.$emit('lineclick', { index, line })
    },
    format(index, line) {
      try {
        return format(this.metadata[index][1])(line[index])
      } catch (e) {
        return this.t[line[index]] || line[index]
      }
    },
  },
}
</script>
