<template>
  <div>
    <div class="section">
      <b-field label="Add to watch list"></b-field>
      <b-field>
        <b-input v-model="specNumber" placeholder="Spec number"></b-input>
        <p class="control">
          <button class="button is-success" v-on:click="add(specNumber)">✚</button>
        </p>
      </b-field>
    </div>
    <div id="specWatchListWrapper" class="section columns">
      <div v-for="(sn, idx) in specNumbers" v-bind:key="sn" class="column is-one-third">
        <spec-table :heading="sn" :data="specLists[idx]" :lastUpdate="new Date(lastUpdates[idx])"
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
        specNumbers: [],
        specLists: [],
        lastUpdates: []
      }
    },
    methods: {
      add: function (specNumber) {
        if (this.specNumbers.includes(specNumber)) {
          return
        }
        this.specNumbers.push(specNumber)
        this.specLists.push([])
        this.lastUpdates.push(null)
      },
      update: function (data, specNumber) {
        let idx = this.specNumbers.findIndex((item) => {
          return item === specNumber
        })
        if (idx === -1) {
          return
        }
        this.$set(this.specLists, idx, data)
        this.$set(this.lastUpdates, idx, new Date())
      },
      remove: function (specNumber) {
        const idx = this.specNumbers.findIndex((item) => {
          return item === specNumber
        })
        if (idx === -1) {
          return
        }
        this.specNumbers.splice(idx, 1)
        this.specLists.splice(idx, 1)
        this.lastUpdates.splice(idx, 1)
      }
    },
    mounted () {
      ipcRenderer.removeAllListeners('specWatchDog-filePath')
      ipcRenderer.on('specWatchDog-filePath', (event, data) => {
        this.watchListFilePath = JSON.parse(data)
        let items = JSON.parse(readFileSync(this.watchListFilePath, 'utf8'))
        this.specNumbers = Object.keys(items)
        for (let i = 0; i < this.specNumbers.length; i++) {
          let specNumber = this.specNumbers[i]
          this.specLists.push(items[specNumber].data)
          this.lastUpdates.push(items[specNumber].lastUpdate)
        }
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
