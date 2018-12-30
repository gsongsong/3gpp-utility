<template>
  <div id="wrapper" class="section">
    <div class="columns">
      <div class="column is-one-quarter">
        <frequency-table heading="RAT 1 Downlink" v-on:data-changed="onDataChange($event, 'rat1Dl')">
        </frequency-table>
      </div>
      <div class="column is-one-quarter">
        <frequency-table heading="RAT 1 Uplink" v-on:data-changed="onDataChange($event, 'rat1Ul')">
        </frequency-table>
      </div>
      <div class="column is-one-quarter">
        <frequency-table heading="RAT 2 Downlink" v-on:data-changed="onDataChange($event, 'rat2Dl')">
        </frequency-table>
      </div>
      <div class="column is-one-quarter">
        <frequency-table heading="RAT 2 Uplink" v-on:data-changed="onDataChange($event, 'rat2Ul')">
        </frequency-table>
      </div>
    </div>
    <div class="columns is-centered">
      <div class="column is-one-quarter has-text-centered">
        <b-field label="Harmonics order from 2 to">
          <b-input type="number" min="2" max="9" v-model="orderHarmonics"></b-input>
        </b-field>
      </div>
      <div class="column is-one-quarter has-text-centered">
        <b-field label="IMD order from 2 to">
          <b-input type="number" min="2" max="9" v-model="orderImd"></b-input>
        </b-field>
      </div>
    </div>
    <div class="columns">
      <div class="column has-text-centered">
        <button class="button is-success" v-on:click="calculate">
          Calculate
        </button>
        <b-loading :active.sync="isWorking" :is-full-page="true"></b-loading>
      </div>
    </div>
    <div class="columns is-centered">
      <div class="column">
        <idc-table heading="Harmonic Interference" :data="bandsHarmonics">
        </idc-table>
      </div>
      <div class="column">
        <idc-table heading="IMD Interference" :data="bandsImd">
        </idc-table>
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
  import { ipcRenderer } from 'electron'

  import FrequencyTable from './FrequencyTable'
  import IdcTable from './IdcTable'

  export default {
    components: { FrequencyTable, IdcTable },
    data () {
      return {
        rat1Dl: [],
        rat1Ul: [],
        rat2Dl: [],
        rat2Ul: [],
        orderHarmonics: 2,
        orderImd: 2,
        isWorking: false,
        bandsHarmonics: [],
        bandsImd: []
      }
    },
    methods: {
      convertBandsIdcToFreqTable (bands) {
        let freqs = []
        for (let i = 0; i < bands.length; i++) {
          for (let victim of bands[i].victims) {
            freqs.push({
              order: bands[i].idcOrder,
              name: bands[i].name,
              fLow: bands[i].fLow,
              fHigh: bands[i].fHigh,
              victim: victim.name
            })
          }
        }
        return freqs
      },
      calculate: function () {
        this.isWorking = true
        ipcRenderer.send('idc-request', JSON.stringify({
          rat1Dl: this.rat1Dl,
          rat1Ul: this.rat1Ul,
          rat2Dl: this.rat2Dl,
          rat2Ul: this.rat2Ul,
          orderHarmonics: this.orderHarmonics,
          orderImd: this.orderImd
        }))
      },
      onDataChange: function (data, freqTableName) {
        this[freqTableName] = data
      }
    },
    mounted () {
      ipcRenderer.on('idc-response', (event, data) => {
        let result = JSON.parse(data)
        if (result.error) {
          this.$snackbar.open({
            message: result.error,
            type: 'is-warning',
            position: 'is-bottom-right',
            actionText: 'Dismiss',
            indefinite: true,
            queue: false
          })
        } else {
          let { bandsHarmonics, bandsImd } = result
          this.bandsHarmonics = this.convertBandsIdcToFreqTable(bandsHarmonics)
          this.bandsImd = this.convertBandsIdcToFreqTable(bandsImd)
        }
        this.isWorking = false
      })
    }
  }
</script>

<style>
</style>
