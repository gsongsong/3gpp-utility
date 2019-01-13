<template>
  <div>
    <div class="section">
      <b-field>
        <b-input v-model="specNumber" placeholder="Spec number" v-on:keyup.native.enter="add(specNumber)"></b-input>
        <p class="control">
          <button class="button is-success" v-on:click="add(specNumber)" :disabled="!specNumber">
            Add to watch list
          </button>
        </p>
      </b-field>
    </div>
    <div id="specWatchListWrapper" class="section columns">
      <div v-for="(data, sn) in watchList" v-bind:key="sn" class="column is-one-third">
        <spec-table :heading="sn" :data="data.files" :lastUpdate="new Date(data.lastUpdate)"
          v-on:spec-list-changed="update($event, sn)" v-on:remove="remove(sn)"
          v-on:spec-list-updating="working(sn)"></spec-table>
      </div>
    </div>
  </div>
</template>

<script>
  import { readFileSync, writeFileSync } from 'fs'
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
      completedAll () {
        for (let watchItem in this.watchList) {
          if (!this.watchList[watchItem].completed) {
            return false
          }
          return true
        }
      },
      add (specNumber) {
        if (this.watchList[specNumber]) {
          return
        }
        this.$set(this.watchList, specNumber, {
          files: [],
          lastUpdate: null,
          completed: false
        })
        this.specNumber = ''
      },
      working (specNumber) {
        this.$set(this.watchList, specNumber, Object.assign(this.watchList[specNumber], {completed: false}))
      },
      update (data, specNumber) {
        if (data !== null) {
          this.$set(this.watchList, specNumber, {
            files: data,
            lastUpdate: new Date()
          })
        }
        this.$set(this.watchList, specNumber, Object.assign(this.watchList[specNumber], {completed: true}))
        if (data !== null) {
          this.save()
        }
      },
      remove (specNumber) {
        this.$delete(this.watchList, specNumber)
        this.save()
      },
      save () {
        if (this.completedAll()) {
          writeFileSync(this.watchListFilePath, JSON.stringify(this.watchList))
        }
      }
    },
    mounted () {
      ipcRenderer.removeAllListeners('specWatchDog-filePath')
      ipcRenderer.on('specWatchDog-filePath', (event, data) => {
        this.watchListFilePath = JSON.parse(data)
        this.watchList = JSON.parse(readFileSync(this.watchListFilePath, 'utf8'))
        for (let specNumber in this.watchList) {
          this.$set(this.watchList, specNumber, Object.assign(this.watchList[specNumber], {completed: false}))
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
