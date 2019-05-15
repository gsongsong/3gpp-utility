const { readFileSync } = require('fs')

const extractRan2 = require('third-gen-asn1-extractor')
const parseRan2 = require('third-gen-asn1-parser').parse
const formatRan2 = require('third-gen-message-formatter-ran2').format
const ran3 = require('third-gen-message-formatter-ran3')
const parseRan3 = ran3.parse
const formatRan3 = ran3.format

process.on('message', (msg) => {
  const {event, data} = msg
  handlers[event](data)
})

handlers = {
  'format-request': format,
  'format-path-response': saveFormatted
}

let formatted
function format (data) {
  let {filePath, specType, msgIeName, raw} = JSON.parse(data)
  try {
    if (specType === 'RRC Protocol') {
      let text = extractRan2(readFileSync(filePath, 'utf8'))
      let asn1Json = parseRan2(text)
      formatted = formatRan2(msgIeName, asn1Json, raw)
    } else if (specType === 'Application Protocol') {
      let html = readFileSync(filePath, 'utf8')
      let definitions = parseRan3(html)
      formatted = formatRan3(msgIeName, definitions, raw)
    }
    process.send({
      event: 'format-path-request',
    })
  } catch (e) {
    process.send({
      event: 'format-response',
      data: JSON.stringify({error: e})
    })
  }
}

function saveFormatted(data) {
  let { filePath } = JSON.parse(data)
  try {
    formatted.write(filePath, (err, stats) => {
      if (err) {
        throw err
      } else {
        process.send({
          event: 'format-response',
          data: JSON.stringify({success: true})
        })
      }
    })
  } catch (e) {
    process.send({
      event: 'format-response',
      data: JSON.stringify({error: err})
    })
  }
}
