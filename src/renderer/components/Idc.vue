<template>
  <div id="wrapper" class="section">
    <div class="columns">
      <div class="column is-one-quarter">
        <frequency-table :heading="'RAT 1 Downlink'">
        </frequency-table>
      </div>
      <div class="column is-one-quarter">
        <frequency-table :heading="'RAT 1 Uplink'">
        </frequency-table>
      </div>
      <div class="column is-one-quarter">
        <frequency-table :heading="'RAT 2 Downlink'">
        </frequency-table>
      </div>
      <div class="column is-one-quarter">
        <frequency-table :heading="'RAT 2 Uplink'">
        </frequency-table>
      </div>
    </div>
    <div class="columns is-centered">
      <div class="column is-one-quarter has-text-centered">
        <b-field label="Harmonics order up to">
          <b-input type="number" min="2" max="9"></b-input>
        </b-field>
      </div>
      <div class="column is-one-quarter has-text-centered">
        <b-field label="IMD order up to">
          <b-input type="number" min="2" max="9"></b-input>
        </b-field>
      </div>
    </div>
    <div class="columns">
      <div class="column has-text-centered">
        <button class="button is-success">
          Calculate
        </button>
      </div>
    </div>
    <div class="columns is-centered">
      <div class="column is-two-fifths">
        <harmonics-table :heading="'Harmonic Interference'">
        </harmonics-table>
      </div>
      <div class="column is-three-fifths">
        <imd-table :heading="'IMD Interference'">
        </imd-table>
      </div>
    </div>
    <div class="columns is-centered">
      <button class="button is-success">
        Save
      </button>
    </div>
  </div>
</template>

<script>
  import FrequencyTable from './FrequencyTable'
  import HarmonicsTable from './HarmonicsTable'
  import ImdTable from './ImdTable'

  export default {
    components: { FrequencyTable, HarmonicsTable, ImdTable },
    data () {
      return {
      }
    }
  }
</script>

<style>
</style>
