<template>
  <div id="app">
    <nav-bar></nav-bar>
    <router-view></router-view>
  </div>
</template>

<script>
  import NavBar from './components/NavBar'

  export default {
    name: 'third-gen-electron',
    components: { NavBar }
  }
</script>

<style>
  /* CSS */
</style>
