const { readFileSync } = require('fs')
const { cloneDeep } = require('lodash')
const { asn1, ran3Ap } = require('third-gen')

process.on('message', (msg) => {
  const {event, data} = msg
  handlers[event](data)
})

const handlers = {
  'ie-list-request': ieList,
  'format-request': format,
  'format-path-response': saveFormatted
}

let asn1Json
let definitions
let formatted
function format (data) {
  let {filePath, specType, msgIeName, raw} = JSON.parse(data)
  try {
    if (specType === 'RRC Protocol') {
      if (!asn1Json) {
        let text = readFileSync(filePath, 'utf8')
        asn1Json = asn1.parse(text)
      }
      let msgIes = asn1.findMsgIes(msgIeName, asn1Json)
      if (!raw) {
        let asn1JsonClone = cloneDeep(asn1Json)
        let msgIesExpanded = msgIes.map((msgIe) => {
          return asn1.expand(msgIe, asn1JsonClone)
        })
        msgIes = msgIesExpanded
      }
      formatted = asn1.formatXlsx(msgIes, asn1Json)
    } else if (specType === 'Application Protocol') {
      if (!definitions) {
        let html = readFileSync(filePath, 'utf8')
        definitions = ran3Ap.parse(html)
      }
      let msgIeDefinitions = null
      if (msgIeName === 'all') {
        msgIeDefinitions = Object.keys(definitions).filter((key) => {
          return typeof definitions[key] !== 'string'
        }).map((sectionNumber) => {
          return definitions[sectionNumber]
        })
      } else {
        if (!(msgIeName in definitions)) {
          throw Error(`Definition for a given name ${msgIeName} is not found`)
        }
        const sectionNumber = definitions[msgIeName]
        msgIeDefinitions = [definitions[sectionNumber]]
      }
      if (!raw) {
        let definitionsExpanded = {}
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < msgIeDefinitions.length; i++) {
          ({msgIeDefinition: msgIeDefinitions[i], definitionsExpanded} =
            ran3Ap.expand(msgIeDefinitions[i], definitions, definitionsExpanded))
        }
      }
      formatted = ran3Ap.format(msgIeDefinitions)
    }
    process.send({
      event: 'format-path-request'
    })
  } catch (e) {
    process.send({
      event: 'format-response',
      data: JSON.stringify({error: e})
    })
  }
}

function ieList (data) {
  let {filePath, specType} = JSON.parse(data)
  let result = {}
  try {
    if (specType === 'RRC Protocol') {
      let text = readFileSync(filePath, 'utf8')
      asn1Json = asn1.parse(text)
      result.msgIeList = []
      for (let moduleName in asn1Json) {
        result.msgIeList = result.msgIeList.concat(Object.keys(asn1Json[moduleName].assignments))
      }
    } else if (specType === 'Application Protocol') {
      let html = readFileSync(filePath, 'utf8')
      definitions = ran3Ap.parse(html)
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
  process.send({
    event: 'ie-list-response',
    data: JSON.stringify(result)
  })
}

function saveFormatted (data) {
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
      data: JSON.stringify({error: e})
    })
  }
}
