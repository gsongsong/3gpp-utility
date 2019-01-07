<template>
  <div class="card">
    <div class="card-header">
      <p class="card-header-title">
        {{ heading }}
      </p>
      <p class="card-header-icon">
        <a v-on:click="emitRemove(heading)" class="has-text-danger">🞬</a>
      </p>
    </div>
    <p class="card-content" style="position: relative;">
      <b-table class="table is-fullwidth" :data="data" striped narrowed hoverable>
        <template slot-scope="props">
          <b-table-column field="fileName" label="File name">
            <a v-on:click="open(props.row.url)" class="has-text-success">{{ props.row.name }}</a>
          </b-table-column>
          <b-table-column field="version" label="Version" centered>
            {{ `${props.row.version[0]}.${props.row.version[1]}.${props.row.version[2]}` }}
          </b-table-column>
          <b-table-column field="date" label="Date" centered>
            {{ `${props.row.date.getFullYear()}-${props.row.date.getMonth() + 1}-${props.row.date.getDate()}` }}
          </b-table-column>
        </template>
        <template slot="footer">
          <div class="has-text-right has-text-grey" v-if="data.length">
            Last update: {{ `${lastUpdate.getFullYear()}-${lastUpdate.getMonth() + 1}-${lastUpdate.getDate()}` }}
          </div>
        </template>
      </b-table>
      <b-loading :active.sync="isWorking" :is-full-page="false"></b-loading>
    </p>
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
        default: ''
      },
      lastUpdate: {
        type: Date,
        default: new Date()
      }
    },
    data () {
      return {
        isWorking: true
      }
    },
    methods: {
      emitRemove: function (specNumber) {
        this.$emit('remove', this.heading)
      },
      open: function (url) {
        shell.openExternal(url)
      },
      getList: function () {
        GetList(this.heading, (err, list) => {
          this.isWorking = false
          if (err) {
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
          this.$emit('spec-list-changed', list.slice(0, 3))
        })
      }
    },
    mounted () {
      this.getList()
    }
  }
</script>

<style>
</style>
