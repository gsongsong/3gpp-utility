<template>
  <div id="wrapper" class="section">
    <div class="columns">
      <div class="column is-one-quarter">
        <frequency-table :heading="rat1DlHeading" v-on:data-changed="onDataChange($event, 'rat1Dl')">
        </frequency-table>
      </div>
      <div class="column is-one-quarter">
        <frequency-table :heading="rat1UlHeading" v-on:data-changed="onDataChange($event, 'rat1Ul')">
        </frequency-table>
      </div>
      <div class="column is-one-quarter">
        <frequency-table :heading="rat2DlHeading" v-on:data-changed="onDataChange($event, 'rat2Dl')">
        </frequency-table>
      </div>
      <div class="column is-one-quarter">
        <frequency-table :heading="rat2UlHeading" v-on:data-changed="onDataChange($event, 'rat2Ul')">
        </frequency-table>
      </div>
    </div>
    <div class="columns is-centered">
      <div class="column is-one-quarter has-text-centered">
        <b-field position="is-centered">
          <p class="control">
            <span class="button is-static">
              Harmonics order up to
            </span>
          </p>
          <b-input type="number" min="2" max="9" v-model="orderHarmonics"></b-input>
        </b-field>
      </div>
      <div class="column is-one-quarter has-text-centered">
        <b-field position="is-centered">
          <p class="control">
            <span class="button is-static">
              IMD order up to
            </span>
          </p>
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
      <button class="button is-success" v-on:click="save">
        Save
      </button>
    </div>
  </div>
</template>

<script>
  import { parse } from 'path'
  import { ipcRenderer, remote } from 'electron'
  import * as xl from 'excel4node'

  import FrequencyTable from './FrequencyTable'
  import IdcTable from './IdcTable'

  export default {
    components: { FrequencyTable, IdcTable },
    data () {
      return {
        rat1DlHeading: 'RAT 1 Downlink',
        rat1UlHeading: 'RAT 1 Uplink',
        rat2DlHeading: 'RAT 2 Downlink',
        rat2UlHeading: 'RAT 2 Uplink',
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
      },
      insertFreqTable (freqs, heading, ws, rowStart, colStart) {
        let row = rowStart
        let col = colStart
        ws.cell(row, col).string(heading)
        row++
        ws.cell(row, col).string('Name')
        ws.cell(row, col + 1).string('Freq Low')
        ws.cell(row, col + 2).string('Freq High')
        for (let freq of freqs) {
          row++
          ws.cell(row, col).string(freq.name)
          ws.cell(row, col + 1).number(freq.fLow)
          ws.cell(row, col + 2).number(freq.fHigh)
        }
      },
      insertIdcFreqTable (freqs, heading, ws, rowStart, colStart) {
        let row = rowStart
        let col = colStart
        ws.cell(row, col).string(heading)
        row++
        ws.cell(row, col).string('Order')
        ws.cell(row, col + 1).string('Name')
        ws.cell(row, col + 2).string('Freq Low')
        ws.cell(row, col + 3).string('Freq High')
        ws.cell(row, col + 4).string('Victim')
        for (let freq of freqs) {
          row++
          ws.cell(row, col).number(freq.order)
          ws.cell(row, col + 1).string(freq.name)
          ws.cell(row, col + 2).number(freq.fLow)
          ws.cell(row, col + 3).number(freq.fHigh)
          ws.cell(row, col + 4).string(freq.victim)
        }
      },
      save: function () {
        if (!this.bandsHarmonics.length && !this.bandsImd.length) {
          return
        }
        this.isWorking = true
        let wb = new xl.Workbook()
        let ws = wb.addWorksheet('Sheet 1')
        this.insertFreqTable(this.rat1Dl, this.rat1DlHeading, ws, 1, 2)
        this.insertFreqTable(this.rat1Ul, this.rat1UlHeading, ws, 1, 6)
        this.insertFreqTable(this.rat2Dl, this.rat2DlHeading, ws, 1, 10)
        this.insertFreqTable(this.rat2Ul, this.rat2UlHeading, ws, 1, 14)
        let maxNumFreqs = Math.max(this.rat1Dl.length, this.rat1Ul.length, this.rat2Dl.length, this.rat2Ul.length)
        this.insertIdcFreqTable(this.bandsHarmonics, 'Harmonic Interference', ws, maxNumFreqs + 4, 1)
        this.insertIdcFreqTable(this.bandsImd, 'IMD Interference', ws, maxNumFreqs + 4, 9)
        let savePath = remote.dialog.showSaveDialog({
          defaultPath: this.defaultPath ? this.defaultPath : null,
          filters: [
            {name: 'XLSX', extensions: ['xlsx']}
          ]
        })
        if (savePath) {
          this.defaultPath = parse(savePath).dir
          wb.write(savePath)
        }
        this.isWorking = false
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
