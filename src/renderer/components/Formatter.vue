<template>
  <div id="wrapper" class="section">
    <b-field class="file">
      <b-upload v-model="file" v-on:input="checkSpecType($event)">
        <a class="button is-success">
          <span>Choose spec file</span>
        </a>
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
      <b-field class="control" grouped>
        <b-input v-model="msgIeName" :disabled="specType === 'Unknown'" placeholder="Message/IE name"></b-input>
        <b-checkbox v-model="doNotExpand" native-value="true" :disabled="specType === 'Unknown'" type="is-success">Do not expand sub-IE</b-checkbox>
      </b-field>
      <b-field grouped>
        <p class="control">
          <button class="button is-success" :disabled="specType === 'Unknown' || !msgIeName" v-on:click="format(msgIeName)">Format message/IE</button>
        </p>
        <p class="control">
          <b-tooltip label="Application Protocol only" position="is-right" type="is-info">
            <button class="button is-success" :disabled="specType !== 'Application Protocol'" v-on:click="format('__all')">Format all</button>
          </b-tooltip>
        </p>
      </b-field>
      <b-loading :active.sync="isFormatting" :is-full-page="true"></b-loading>
    </div>
  </div>
</template>

<script>
  import { parse } from 'path'
  import { ipcRenderer, remote, shell } from 'electron'
  import * as xlsx from '@gsongsong/xlsx'

  export default {
    data () {
      return {
        file: null,
        specType: 'Unknown',
        msgIeName: null,
        doNotExpand: [],
        isFormatting: false,
        defaultPathDir: null
      }
    },
    methods: {
      checkSpecType: function (file) {
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
          return
        }
        if (indexAp >= 0 && (indexRrc === -1 || (indexRrc >= 0 && indexAp < indexRrc))) {
          this.specType = 'Application Protocol'
        }
      },
      format: function (msgIeName) {
        this.isFormatting = true
        if (msgIeName === '__all') {
          this.msgIeName = null
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
      ipcRenderer.removeAllListeners('format-response')
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
          let pathParsed = parse(this.file.path)
          let defaultPathDir = this.defaultPathDir ? this.defaultPathDir : pathParsed.dir
          let msgIeName = this.msgIeName ? `${this.msgIeName}-` : ''
          let raw = this.doNotExpand.length ? '-raw' : ''
          let savePath = remote.dialog.showSaveDialog({
            defaultPath: `${defaultPathDir}/${msgIeName}${pathParsed.name}${raw}.xlsx`
          })
          if (savePath) {
            try {
              this.defaultPathDir = parse(savePath).dir
              xlsx.writeFile(result, savePath)
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
        }
        this.isFormatting = false
      })
    }
  }
</script>

<style>
</style>
