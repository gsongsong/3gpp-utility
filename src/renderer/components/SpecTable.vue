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
          <b-table-column field="date" label="Date">
            {{ `${props.row.date.getFullYear()}-${props.row.date.getMonth()}-${props.row.date.getDate()}` }}
          </b-table-column>
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
      }
    },
    data () {
      return {
        data: [],
        isWorking: true
      }
    },
    methods: {
      emitRemove: function (specNumber) {
        this.$emit('remove', this.heading)
      },
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
