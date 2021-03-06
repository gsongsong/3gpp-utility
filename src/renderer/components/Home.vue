<template>
  <div>
    <div class="section">
      <b-field>
        <b-input v-model="specNumber" placeholder="Spec number" @keyup.native.enter="add(specNumber)" />
        <p class="control">
          <button class="button is-success" @click="add(specNumber)" :disabled="!specNumber">
            Add to watch list
          </button>
        </p>
      </b-field>
    </div>
    <div id="specWatchListWrapper" class="section columns">
      <div v-for="sn in watchListSpecNumbers" v-bind:key="sn" class="column is-one-third">
        <spec-table :heading="sn" :data="watchList[sn].files" :lastUpdate="new Date(watchList[sn].lastUpdate)"
          @spec-list-updating="working(sn)" @spec-list-change="update($event, sn)"
          @remove="remove(sn)" />
      </div>
    </div>
  </div>
</template>

<script>
  import { existsSync, readFileSync, writeFileSync } from 'fs'
  import { join } from 'path'
  import { remote } from 'electron'
  import SpecTable from './SpecTable'

  export default {
    name: 'home',
    components: { SpecTable },
    data () {
      return {
        specNumber: '',
        watchListFilePath: '',
        watchListSpecNumbers: [],
        watchList: {}
      }
    },
    methods: {
      completedAll () {
        for (let watchItem in this.watchList) {
          if (!this.watchList[watchItem].completed) {
            return false
          }
        }
        return true
      },
      add (specNumber) {
        if (this.watchList[specNumber]) {
          return
        }
        this.watchListSpecNumbers.push(specNumber)
        this.watchListSpecNumbers = this.watchListSpecNumbers.sort()
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
        this.save()
      },
      remove (specNumber) {
        const index = this.watchListSpecNumbers.findIndex((element) => {
          return element === specNumber
        })
        if (index !== -1) {
          this.watchListSpecNumbers.splice(index, 1)
        }
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
      let appPath = remote.app.getPath('home')
      let appDir = join(appPath, '.3gpp-electron')
      this.watchListFilePath = join(appDir, 'specWatchList.json')
      if (!existsSync(this.watchListFilePath)) {
        writeFileSync(this.watchListFilePath, JSON.stringify({}))
      }
      this.watchList = JSON.parse(readFileSync(this.watchListFilePath, 'utf8'))
      this.watchListSpecNumbers = Object.keys(this.watchList).sort()
      for (let specNumber in this.watchList) {
        this.$set(this.watchList, specNumber, Object.assign(this.watchList[specNumber], {completed: false}))
      }
    }
  }
</script>

<style>
  #specWatchListWrapper {
    display: flex;
    flex-wrap: wrap;
  }
</style>
