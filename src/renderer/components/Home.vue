<template>
  <div>
    <div class="section">
      <b-field label="Add to watch list"></b-field>
      <b-field>
        <b-input placeholder="Spec number"></b-input>
        <p class="control">
          <button class="button is-success">✚</button>
        </p>
      </b-field>
    </div>
    <div id="specWatchListWrapper" class="section columns">
      <div v-for="item in items" v-bind:key="item" class="column is-one-quarter">
        <spec-table :heading="item"></spec-table>
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
        items: ['36.331']
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
