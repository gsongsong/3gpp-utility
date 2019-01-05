<template>
  <div class="panel">
    <div class="panel-heading">
      <span v-if="heading">
        {{ heading }}
      </span>
      <b-field v-if="!heading">
        <b-input placeholder="Spec number"></b-input>
        <p class="control">
          <button class="button is-success">✚</button>
        </p>
      </b-field>
    </div>
    <div class="panel-block">
      <b-table :data="block" v-if="heading" striped narrowed hoverable>
        <template slot-scope="props">
          <b-table-column field="fileName" label="File name">
            {{ props.row.name }}
          </b-table-column>
          <b-table-column field="fileName" label="Date">
            {{ props.row.date }}
          </b-table-column>
        </template>
      </b-table>
      <span v-if="!heading">
        Add spec number of interest
      </span>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      heading: {
        type: String,
        default: ''
      },
      block: {
        type: Array,
        default: []
      }
    },
    data () {
      return {
      }
    },
    methods: {
    }
  }
</script>

<style>
</style>
