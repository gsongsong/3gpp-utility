<template>
  <div id="wrapper" class="section">
    <div class="columns">
      <div class="column">
        <frequency-table :heading="'RAT 1 Downlink'">
        </frequency-table>
      </div>
      <div class="column">
        <frequency-table :heading="'RAT 1 Uplink'">
        </frequency-table>
      </div>
      <div class="column">
        <frequency-table :heading="'RAT 2 Downlink'">
        </frequency-table>
      </div>
      <div class="column">
        <frequency-table :heading="'RAT 2 Uplink'">
        </frequency-table>
      </div>
    </div>
    <div class="columns is-centered">
      <button class="button is-success">
        Calculate
      </button>
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
