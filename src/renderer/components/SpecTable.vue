<template>
  <div class="card">
    <div class="card-header">
      <p class="card-header-title">{{ heading }}</p>
      <p class="card-header-icon">
        <a class="has-text-success" @click="getList(true)">
          <font-awesome-icon icon="sync" />
        </a>
      </p>
      <p class="card-header-icon">
        <a class="has-text-danger" @click="$emit('remove')">
          <font-awesome-icon icon="times" />
        </a>
      </p>
    </div>
    <p class="card-content" style="position: relative;">
      <b-table class="table is-fullwidth" :data="data" striped narrowed hoverable>
        <template slot-scope="props">
          <b-table-column field="fileName" label="File name">
            <a class="has-text-success" @click="open(props.row.url)">
              {{ props.row.name }}
            </a>
          </b-table-column>
          <b-table-column field="version" label="Version" centered>
            {{ version(props.row.version) }}
          </b-table-column>
          <b-table-column field="date" label="Date" centered>
            {{ `${yyyyMmDd(props.row.date)}` }}
          </b-table-column>
        </template>
        <template slot="footer">
          <div class="has-text-right has-text-grey" v-if="data.length">
            Last update: {{ `${yyyyMmDd(lastUpdate)}` }}
          </div>
        </template>
      </b-table>
    </p>
    <b-loading :active.sync="isWorking" :is-full-page="false" />
  </div>
</template>

<script>
  import { shell } from 'electron'
  import { GetList } from 'third-gen-spec-list'

  export default {
    props: {
      heading: {
        type: String,
        default: ''
      },
      data: {
        type: Array,
        default: []
      },
      lastUpdate: {
        type: Date,
        default: null // 1970-01-01
      }
    },
    data () {
      return {
        isWorking: false
      }
    },
    methods: {
      open (url) {
        shell.openExternal(url)
      },
      getList (forced = false) {
        this.isWorking = true
        this.$emit('spec-list-updating')
        let timeDiffMs = new Date().getTime() - new Date(this.lastUpdate).getTime()
        if (timeDiffMs / 1000 / 60 / 60 / 24 < 1 && !forced) {
          this.isWorking = false
          this.$emit('spec-list-change', null)
          return
        }
        GetList(this.heading, (err, list) => {
          this.isWorking = false
          if (err) {
            this.$emit('spec-list-change', null)
            return
          }
          list.sort((a, b) => {
            if (a.version[0] === b.version[0]) {
              if (a.version[1] === b.version[1]) {
                return b.version[2] - a.version[2]
              }
              return b.version[1] - a.version[1]
            }
            return b.version[0] - a.version[0]
          })
          this.$emit('spec-list-change', list.slice(0, 3))
        })
      },
      version (versionArr) {
        return `${versionArr[0]}.${versionArr[1]}.${versionArr[2]}`
      },
      yyyyMmDd (dateString) {
        let date = new Date(dateString)
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      }
    },
    mounted () {
      this.getList()
    }
  }
</script>

<style>
</style>
