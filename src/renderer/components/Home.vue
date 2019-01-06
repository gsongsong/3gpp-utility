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
      <div v-for="item in items" v-bind:key="item" class="column is-one-quarter">
        <spec-table :heading="item" v-on:remove="remove($event)"></spec-table>
      </div>
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
        specNumber: '',
        items: ['36.331']
      }
    },
    methods: {
      add: function (specNumber) {
        if (this.items.includes(specNumber)) {
          return
        }
        this.items.push(specNumber)
      },
      remove: function (specNumber) {
        const idx = this.items.findIndex((item) => {
          return item === specNumber
        })
        if (idx === -1) {
          return
        }
        this.items.splice(idx, 1)
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
