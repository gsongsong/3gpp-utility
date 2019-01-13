<template>
  <h1>This is a Worker Process</h1>
</template>

<script>
  import { readFileSync } from 'fs'
  import { join as joinPath, parse as parsePath } from 'path'
  import { ipcRenderer } from 'electron'

  import * as extractRan2 from 'third-gen-asn1-extractor'
  import {parse as parseRan2} from 'third-gen-asn1-parser'
  import { format as formatRan2 } from 'third-gen-message-formatter-ran2'
  import { parse as parseRan3, format as formatRan3 } from 'third-gen-message-formatter-ran3'

  import { diffAll as diff } from 'third-gen-message-diff'
  import * as pug from 'pug'

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
      ipcRenderer.on('ie-list-request', (event, data) => {
        let {filePath, specType} = JSON.parse(data)
        let result = {}
        try {
          if (specType === 'RRC Protocol') {
            let text = extractRan2(readFileSync(filePath, 'utf8'))
            let asn1Json = parseRan2(text)
            result.msgIeList = []
            for (let moduleName in asn1Json) {
              result.msgIeList = result.msgIeList.concat(Object.keys(asn1Json[moduleName]))
            }
          } else if (specType === 'Application Protocol') {
            let html = readFileSync(filePath, 'utf8')
            let definitions = parseRan3(html)
            result.msgIeList = []
            for (let sectionNumber in definitions) {
              if (definitions[sectionNumber].name) {
                result.msgIeList.push(definitions[sectionNumber].name)
              }
            }
          }
        } catch (e) {
          result = {error: e}
        }
        event.sender.send('ie-list-response', JSON.stringify(result))
      })
      ipcRenderer.on('format-request', (event, data/* filePath, specType, msgIeName, doNotExpand */) => {
        let {filePath, specType, msgIeName, raw} = JSON.parse(data)
        let result = {}
        try {
          if (specType === 'RRC Protocol') {
            let text = extractRan2(readFileSync(filePath, 'utf8'))
            let asn1Json = parseRan2(text)
            result = formatRan2(msgIeName, asn1Json, raw)
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
        let result = {}
        try {
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
          result = {
            bandsHarmonics: bandsHarmonics,
            bandsImd: bandsImd
          }
        } catch (e) {
          result = {error: e}
        }
        event.sender.send('idc-response', JSON.stringify(result))
      })
      ipcRenderer.on('diff-request', (event, data) => {
        let result = {}
        try {
          let { fileOld, fileNew, comparisonMode } = JSON.parse(data)
          let diffResult = diff(fileOld, fileNew)
          result = {
            render: pug.renderFile(joinPath(__static, 'diff.pug'), Object.assign(diffResult, {
              nameOld: parsePath(fileOld).base,
              nameNew: parsePath(fileNew).base,
              comparisonMode: comparisonMode
            }))
          }
        } catch (e) {
          result = {error: e}
        }
        event.sender.send('diff-response', JSON.stringify(result))
      })
      ipcRenderer.send('worker-ready')
    }
  }
</script>
