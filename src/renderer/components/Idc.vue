<template>
  <div id="wrapper" class="section">
    <div class="columns">
      <div class="column">
        <frequency-table :heading="rat1DlHeading" v-on:data-changed="onDataChange($event, 'rat1Dl')">
        </frequency-table>
      </div>
      <div class="column">
        <frequency-table :heading="rat1UlHeading" v-on:data-changed="onDataChange($event, 'rat1Ul')">
        </frequency-table>
      </div>
      <div class="column">
        <frequency-table :heading="rat2DlHeading" v-on:data-changed="onDataChange($event, 'rat2Dl')">
        </frequency-table>
      </div>
      <div class="column">
        <frequency-table :heading="rat2UlHeading" v-on:data-changed="onDataChange($event, 'rat2Ul')">
        </frequency-table>
      </div>
    </div>
    <div class="columns is-centered">
      <div class="column is-one-quarter">
        <b-field position="is-centered">
          <p class="control">
            <span class="button is-static">
              Harmonics order up to
            </span>
          </p>
          <b-input type="number" min="2" max="9" v-model="orderHarmonics"></b-input>
        </b-field>
      </div>
      <div class="column is-one-quarter">
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
    <div class="columns">
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
  import { writeFileSync } from 'fs'
  import { parse } from 'path'
  import { ipcRenderer, remote, shell } from 'electron'
  import * as xl from 'excel4node'

  import FrequencyTable from './FrequencyTable'
  import IdcTable from './IdcTable'

  let xlStyleBorderThinBlack = {
    style: 'thin',
    color: '#000000'
  }
  let xlStyleBorderHat = {
    border: {
      left: xlStyleBorderThinBlack,
      top: xlStyleBorderThinBlack,
      right: xlStyleBorderThinBlack
    }
  }
  let xlStyleBorderTop = {
    border: {
      top: xlStyleBorderThinBlack
    }
  }
  let xlStyleBorderLeft = {
    border: {
      left: xlStyleBorderThinBlack
    }
  }
  let xlStyleBorderRight = {
    border: {
      right: xlStyleBorderThinBlack
    }
  }

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
        ws.cell(row, col, row, col + 2, true).string(heading).style(xlStyleBorderHat)
        row++
        col = colStart
        ws.cell(row, col++).string('Name').style(xlStyleBorderLeft)
        ws.cell(row, col++).string('Freq Low')
        ws.cell(row, col++).string('Freq High').style(xlStyleBorderRight)
        for (let freq of freqs) {
          row++
          col = colStart
          ws.cell(row, col++).string(freq.name).style(xlStyleBorderLeft)
          ws.cell(row, col++).number(freq.fLow)
          ws.cell(row, col++).number(freq.fHigh).style(xlStyleBorderRight)
        }
        row++
        col = colStart
        ws.cell(row, col++).style(xlStyleBorderTop)
        ws.cell(row, col++).style(xlStyleBorderTop)
        ws.cell(row, col++).style(xlStyleBorderTop)
      },
      insertIdcFreqTable (freqs, heading, ws, rowStart, colStart) {
        let row = rowStart
        let col = colStart
        ws.cell(row, col, row, col + 4, true).string(heading).style(xlStyleBorderHat)
        row++
        col = colStart
        ws.cell(row, col++).string('Order').style(xlStyleBorderLeft)
        ws.cell(row, col++).string('Name')
        ws.cell(row, col++).string('Freq Low')
        ws.cell(row, col++).string('Freq High')
        ws.cell(row, col++).string('Victim').style(xlStyleBorderRight)
        for (let freq of freqs) {
          row++
          col = colStart
          ws.cell(row, col++).number(freq.order).style(xlStyleBorderLeft)
          ws.cell(row, col++).string(freq.name)
          ws.cell(row, col++).number(freq.fLow)
          ws.cell(row, col++).number(freq.fHigh)
          ws.cell(row, col++).string(freq.victim).style(xlStyleBorderRight)
        }
        row++
        col = colStart
        ws.cell(row, col++).style(xlStyleBorderTop)
        ws.cell(row, col++).style(xlStyleBorderTop)
        ws.cell(row, col++).style(xlStyleBorderTop)
        ws.cell(row, col++).style(xlStyleBorderTop)
        ws.cell(row, col++).style(xlStyleBorderTop)
      },
      save: function () {
        if (!this.bandsHarmonics.length && !this.bandsImd.length) {
          return
        }
        this.isWorking = true
        let wb = new xl.Workbook()
        let ws = wb.addWorksheet('Sheet 1')
        this.insertFreqTable(this.rat1Dl, this.rat1DlHeading, ws, 2, 3)
        this.insertFreqTable(this.rat1Ul, this.rat1UlHeading, ws, 2, 7)
        this.insertFreqTable(this.rat2Dl, this.rat2DlHeading, ws, 2, 11)
        this.insertFreqTable(this.rat2Ul, this.rat2UlHeading, ws, 2, 15)
        let maxNumFreqs = Math.max(this.rat1Dl.length, this.rat1Ul.length, this.rat2Dl.length, this.rat2Ul.length)
        this.insertIdcFreqTable(this.bandsHarmonics, 'Harmonic Interference', ws, maxNumFreqs + 5, 2)
        this.insertIdcFreqTable(this.bandsImd, 'IMD Interference', ws, maxNumFreqs + 5, 10)
        let savePath = remote.dialog.showSaveDialog({
          filters: [
            {name: 'XLSX', extensions: ['xlsx']}
          ]
        })
        if (savePath) {
          try {
            writeFileSync(savePath, '') // Try-catch hack because wb.write() does not throw an error
            wb.write(savePath)
            this.$snackbar.open({
              message: 'Formatting success',
              type: 'is-success',
              position: 'is-bottom-right',
              actionText: 'Open folder',
              duration: 10 * 1000,
              queue: false,
              onAction: () => {
                shell.openExternal(parse(savePath).dir)
              }
            })
          } catch (e) {
            this.$snackbar.open({
              message: e,
              type: 'is-warning',
              position: 'is-bottom-right',
              actionText: 'Dismiss',
              indefinite: true,
              queue: false
            })
          }
        } else {
          this.$snackbar.open({
            message: 'Save aborted',
            type: 'is-warning',
            position: 'is-bottom-right',
            actionText: 'Dismiss',
            duration: 3 * 1000,
            queue: false
          })
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
