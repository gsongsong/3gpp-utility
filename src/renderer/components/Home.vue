<template>
  <div id="specWatchDogWrapper" class="section columns">
    <div v-for="item in Object.keys(items)" v-bind:key="item" class="column is-one-quarter">
      <spec-table :heading="item" :block="items[item]"></spec-table>
    </div>
  </div>
</template>

<script>
  import SpecTable from './SpecTable'

export default {
    name: 'home',
    components: { SpecTable },
    data () {
      return {
        items: {
          '36.331': [
            {name: '36331-f00.zip', type: '-', size: 0, date: '0000-00-00', url: 'http'}
          ],
          '': []
        }
      }
    }
  }
</script>

<style>
  #specWatchDogWrapper {
    display: flex;
    flex-wrap: wrap;
  }
</style>
