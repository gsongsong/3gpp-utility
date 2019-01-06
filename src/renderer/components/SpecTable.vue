<template>
  <div class="panel">
    <div class="panel-heading">
        {{ heading }}
    </div>
    <div class="panel-block" style="position: relative;">
      <b-table class="table is-fullwidth" :data="data" striped narrowed hoverable>
        <template slot-scope="props">
          <b-table-column field="fileName" label="File name">
            <a v-on:click="open(props.row.url)">{{ props.row.name }}</a>
          </b-table-column>
          <b-table-column field="date" label="Date">
            {{ `${props.row.date.getFullYear()}-${props.row.date.getMonth()}-${props.row.date.getDate()}` }}
          </b-table-column>
        </template>
      </b-table>
      <b-loading :active.sync="isWorking" :is-full-page="false"></b-loading>
    </div>
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
      }
    },
    data () {
      return {
        data: [],
        isWorking: true
      }
    },
    methods: {
      open: function (url) {
        shell.openExternal(url)
      }
    },
    mounted () {
      GetList(this.heading, (err, list) => {
        this.isWorking = false
        if (err) {
          return
        }
        list.reverse()
        // TODO: version aware sorting
        // list.sort((a, b) => {
        //   return b.date - a.date
        // })
        this.data = list.slice(0, 3)
      })
    }
  }
</script>

<style>
</style>
