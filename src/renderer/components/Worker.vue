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

  export default {
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
    }
  }
</script>
