<template>
  <div>
    <div class="section">
      <b-field label="Add to watch list"></b-field>
      <b-field>
        <b-input v-model="specNumber" placeholder="Spec number"></b-input>
        <p class="control">
          <button class="button is-success" v-on:click="add(specNumber)" :disabled="!specNumber">✚</button>
        </p>
      </b-field>
    </div>
    <div id="specWatchListWrapper" class="section columns">
      <div v-for="(data, sn) in watchList" v-bind:key="sn" class="column is-one-third">
        <spec-table :heading="sn" :data="data.files" :lastUpdate="new Date(data.lastUpdate)"
          v-on:spec-list-changed="update($event, sn)" v-on:remove="remove(sn)"></spec-table>
      </div>
    </div>
  </div>
</template>

<script>
  import { readFileSync } from 'fs'
  import { ipcRenderer } from 'electron'
  import SpecTable from './SpecTable'

export default {
    name: 'home',
    components: { SpecTable },
    data () {
      return {
        specNumber: '',
        watchListFilePath: '',
        watchList: {}
      }
    },
    methods: {
      add: function (specNumber) {
        if (this.watchList[specNumber]) {
          return
        }
        this.$set(this.watchList, specNumber, {
          files: [],
          lastUpdate: null
        })
        this.specNumber = ''
      },
      update: function (data, specNumber) {
        this.$set(this.watchList, specNumber, {
          files: data,
          lastUpdate: new Date()
        })
      },
      remove: function (specNumber) {
        this.$delete(this.watchList, specNumber)
      }
    },
    mounted () {
      ipcRenderer.removeAllListeners('specWatchDog-filePath')
      ipcRenderer.on('specWatchDog-filePath', (event, data) => {
        this.watchListFilePath = JSON.parse(data)
        this.watchList = JSON.parse(readFileSync(this.watchListFilePath, 'utf8'))
      })
      ipcRenderer.send('specWatchDog-ready')
    }
  }
</script>

<style>
  #specWatchListWrapper {
    display: flex;
    flex-wrap: wrap;
  }
</style>
