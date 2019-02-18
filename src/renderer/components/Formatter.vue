<template>
  <div id="wrapper" class="section">
    <b-field class="file">
      <b-upload v-model="file" @input="checkSpecType($event)">
        <a class="button is-success">Choose spec file</a>
      </b-upload>
      <span class="file-name" v-if="file">
        {{ file.name }}
        <b-tag :type="[{'is-danger': specType === 'Unknown'},
                       {'is-success': specType !== 'Unknown'}]">
          {{ specType }}
        </b-tag>
      </span>
    </b-field>
    <div>
      <b-field>
        <b-autocomplete v-model="msgIeName" :data="filteredMsgIeList"
          :disabled="specType === 'Unknown'" placeholder="Message/IE name" />
      </b-field>
      <b-field>
        <b-checkbox v-model="doNotExpand" native-value="true"
          :disabled="specType === 'Unknown'" type="is-success">
          Do not expand sub-IE
        </b-checkbox>
      </b-field>
      <b-field grouped>
        <p class="control">
          <button class="button is-success" @click="format(msgIeName)"
            :disabled="specType === 'Unknown' || !msgIeName">
            Format message/IE
          </button>
        </p>
        <p class="control">
          <b-tooltip label="Application Protocol only" position="is-right" type="is-info">
            <button class="button is-success" @click="format('__all')"
              :disabled="specType !== 'Application Protocol'">
              Format all
            </button>
          </b-tooltip>
        </p>
      </b-field>
      <b-loading :active.sync="isWorking" :is-full-page="true" />
    </div>
  </div>
</template>

<script>
  import { parse } from 'path'
  import { ipcRenderer, remote, shell } from 'electron'

  export default {
    data () {
      return {
        file: null,
        specType: 'Unknown',
        msgIeName: '',
        msgIeList: [],
        doNotExpand: [],
        isWorking: false,
        defaultPathDir: null
      }
    },
    computed: {
      filteredMsgIeList () {
        return this.msgIeList.filter((msgIeName) => {
          return msgIeName.toLowerCase().indexOf(this.msgIeName.toLowerCase()) >= 0
        })
      }
    },
    methods: {
      checkSpecType (file) {
        this.isWorking = true
        // File object: https://developer.mozilla.org/en-US/docs/Web/API/File
        // Electron adds `path` attribute: https://tinydew4.github.io/electron-ko/docs/api/file-object/
        let fs = require('fs')
        let content = fs.readFileSync(file.path, 'utf8')
        let indexRrc = content.indexOf('Radio Resource Control')
        let indexAp = content.indexOf('Application Protocol')
        if (indexRrc === -1 && indexAp === -1) {
          this.specType = 'Unknown'
          return
        }
        if (indexRrc >= 0 && (indexAp === -1 || (indexAp >= 0 && indexRrc < indexAp))) {
          this.specType = 'RRC Protocol'
        } else if (indexAp >= 0 && (indexRrc === -1 || (indexRrc >= 0 && indexAp < indexRrc))) {
          this.specType = 'Application Protocol'
        } else {
          this.isWorking = false
          return
        }
        let data = {
          filePath: this.file.path,
          specType: this.specType
        }
        ipcRenderer.send('ie-list-request', JSON.stringify(data))
      },
      format (msgIeName) {
        this.isWorking = true
        if (msgIeName === '__all') {
          this.msgIeName = ''
        }
        let data = {
          filePath: this.file.path,
          specType: this.specType,
          msgIeName: msgIeName,
          raw: !!this.doNotExpand.length
        }
        ipcRenderer.send('format-request', JSON.stringify(data))
      }
    },
    mounted () {
      ipcRenderer.removeAllListeners('ie-list-response')
      ipcRenderer.removeAllListeners('format-path-request')
      ipcRenderer.removeAllListeners('format-response')
      ipcRenderer.on('ie-list-response', (event, data) => {
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
          this.msgIeList = result.msgIeList
          this.isWorking = false
        }
      })
      ipcRenderer.on('format-path-request', (event, data) => {
        let pathParsed = parse(this.file.path)
        let defaultPathDir = this.defaultPathDir ? this.defaultPathDir : pathParsed.dir
        let msgIeName = this.msgIeName ? `${this.msgIeName}-` : ''
        let raw = this.doNotExpand.length ? '-raw' : ''
        let savePath = remote.dialog.showSaveDialog({
          defaultPath: `${defaultPathDir}/${msgIeName}${pathParsed.name}${raw}.xlsx`
        })
        if (savePath) {
          this.defaultPathDir = parse(savePath).dir
          event.sender.send('format-path-response', JSON.stringify({filePath: savePath}))
        } else {
          this.isWorking = false
          this.$snackbar.open({
            message: 'Save aborted',
            type: 'is-warning',
            position: 'is-bottom-right',
            actionText: 'Dismiss',
            duration: 3 * 1000,
            queue: false
          })
        }
      })
      ipcRenderer.on('format-response', (event, data) => {
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
          this.$snackbar.open({
            message: 'Formatting success',
            type: 'is-success',
            position: 'is-bottom-right',
            actionText: 'Open folder',
            duration: 10 * 1000,
            queue: false,
            onAction: () => {
              shell.openExternal(this.defaultPathDir)
            }
          })
        }
        this.isWorking = false
      })
    }
  }
</script>

<style>
</style>
