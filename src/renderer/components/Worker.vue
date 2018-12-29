<template>
  <h1>This is a Worker Process</h1>
</template>

<script>
  import { readFileSync } from 'fs'
  import { ipcRenderer } from 'electron'

  import * as extractRan2 from 'third-gen-asn1-extractor'
  import {parse as parseRan2} from 'third-gen-asn1-parser'
  import { format as formatRan2 } from 'third-gen-message-formatter-ran2'
  import { parse as parseRan3, format as formatRan3 } from 'third-gen-message-formatter-ran3'

  import { Band, calculateHarmonics, calculateIMD } from 'third-gen-distortion-calculator'

  export default {
    methods: {
      convertRatTableToBands (rat) {
        for (let i = 0; i < rat.length; i++) {
          rat[i] = new Band(rat[i].name, rat[i].fLow, rat[i].fHigh)
        }
      }
    },
    mounted () {
      ipcRenderer.on('format-request', (event, data/* filePath, specType, msgIeName, doNotExpand */) => {
        let {filePath, specType, msgIeName, raw} = JSON.parse(data)
        let result = {}
        try {
          if (specType === 'RRC Protocol') {
            console.log('Extracting')
            let text = extractRan2(readFileSync(filePath, 'utf8'))
            console.log('Parsing')
            let asn1Json = parseRan2(text)
            console.log('Formatting')
            result = formatRan2(msgIeName, asn1Json, raw)
            console.log('Done')
          } else if (specType === 'Application Protocol') {
            let html = readFileSync(filePath, 'utf8')
            let definitions = parseRan3(html)
            result = formatRan3(msgIeName, definitions, raw)
          }
        } catch (e) {
          result = {error: e}
        }
        event.sender.send('format-response', JSON.stringify(result))
      })
      ipcRenderer.on('idc-request', (event, data) => {
        let { rat1Dl, rat1Ul, rat2Dl, rat2Ul, orderHarmonics, orderImd } = JSON.parse(data)
        this.convertRatTableToBands(rat1Dl)
        this.convertRatTableToBands(rat1Ul)
        this.convertRatTableToBands(rat2Dl)
        this.convertRatTableToBands(rat2Ul)
        let bandsHarmonics = []
        let bandsImd = []
        for (let order = 2; order <= orderHarmonics; order++) {
          if (rat1Ul.length && rat2Dl.length) {
            bandsHarmonics = bandsHarmonics.concat(calculateHarmonics(rat1Ul, rat2Dl, order))
          }
          if (rat2Ul.length && rat1Dl.length) {
            bandsHarmonics = bandsHarmonics.concat(calculateHarmonics(rat2Ul, rat1Dl, order))
          }
        }
        for (let order = 2; order <= orderImd; order++) {
          if (rat1Ul.length && rat2Ul.length) {
            if (rat1Dl.length) {
              bandsImd = bandsImd.concat(calculateIMD(rat1Ul, rat2Ul, rat1Dl, order))
            }
            if (rat2Dl.length) {
              bandsImd = bandsImd.concat(calculateIMD(rat1Ul, rat2Ul, rat2Dl, order))
            }
          }
        }
        event.sender.send('idc-response', JSON.stringify({
          bandsHarmonics: bandsHarmonics,
          bandsImd: bandsImd
        }))
      })
    }
  }
</script>
