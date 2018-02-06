<style>
.drawer .overlay {
  z-index: 10000;
  position: fixed;
  top: 0;
  left: 0;
  min-width: 100vw;
  min-height: 100vh;
  background: rgba(0, 0, 0, .5);
  cursor: pointer;
}

.drawer .slot {
  z-index: 10001;
  position: fixed;
  top: 0;
  left: 0;
  margin: 10px;
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  overflow: auto;
  background: var(--background);
}

.drawer .close {
  z-index: 10002;
  position: fixed;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  padding: 10px;
  background: rgba(0, 0, 0, .5);
  cursor: pointer;
}

@media (min-width: 600px) {
  .drawer .slot {
    margin: 0;
    width: 60%;
    height: 100%;
  }
}

:root { --transition: all .3s cubic-bezier(.4, .0, .2, 1);--standard-curve: cubic-bezier(.4, .0, .2, 1); }
.fade-enter-active, .fade-leave-active { opacity: 1;transition: var(--transition); }
.fade-enter, .fade-leave-active { opacity: 0; }
.slide-top-enter-active { animation: enter-top .3s var(--standard-curve); }
.slide-top-leave-active { animation: leave-top .3s var(--standard-curve); }
.slide-right-enter-active { animation: enter-right .3s var(--standard-curve); }
.slide-right-leave-active { animation: leave-right .3s var(--standard-curve); }
.slide-bottom-enter-active { animation: enter-bottom .3s var(--standard-curve); }
.slide-bottom-leave-active { animation: leave-bottom .3s var(--standard-curve); }
.slide-left-enter-active { animation: enter-left .3s var(--standard-curve); }
.slide-left-leave-active { animation: leave-left .3s var(--standard-curve); }
@keyframes enter-top { from { transform: translateY(-100%); } }
@keyframes leave-top { to { transform: translateY(-100%); } }
@keyframes enter-right { from { transform: translateX(100%); } }
@keyframes leave-right { to { transform: translateX(100%); } }
@keyframes enter-bottom { from { transform: translateY(100%); } }
@keyframes leave-bottom { to { transform: translateY(100%); } }
@keyframes enter-left { from { transform: translateX(-100%); } }
@keyframes leave-left { to { transform: translateX(-100%); } }
</style>

<template>
<div class="drawer">
  <transition name="fade">
    <div class="overlay" @click="$emit('close')" v-show="openned"></div>
  </transition>
  <transition name="fade">
    <svg class="close" @click="$emit('close')" v-show="openned">
      <line fill="none" stroke="#FFFFFF" stroke-width="2" stroke-miterlimit="10" x1="2" y1="2" x2="18" y2="18" />
      <line fill="none" stroke="#FFFFFF" stroke-width="2" stroke-miterlimit="10" x1="18" y1="2" x2="2" y2="18" />
    </svg>
  </transition>
  <transition :name="$root.size === 'mobile' ? 'slide-top' : 'slide-left'">
    <div class="slot" v-show="openned">
      <slot></slot>
    </div>
  </transition>
</div>
</template>

<script>
export default {
  props: ['openned'],
  mounted() {
    this.ev_keydown = e => e.key === 'Escape' && this.$emit('close')
    window.addEventListener('keydown', this.ev_keydown)
  },
  detached() {
    window.removeEventListener('keydown', this.ev_keydown)
  },
}
</script>
