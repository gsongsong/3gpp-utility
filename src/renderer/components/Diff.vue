<template>
  <div id="wrapper" class="section">
    <b-field class="file">
      <b-upload v-model="fileOld" v-on:input="checkSpecType($event, 'specTypeOld')">
        <a class="button is-success">
          <span>Choose old spec</span>
        </a>
      </b-upload>
      <span class="file-name" v-if="fileOld">
        {{ fileOld.name }}
        <b-tag :type="[{'is-danger': specTypeOld === 'Unknown'},
                        {'is-success': specTypeOld !== 'Unknown'}]">
          {{ specTypeOld }}
        </b-tag>
      </span>
    </b-field>
    <b-field class="file">
      <b-upload v-model="fileNew" v-on:input="checkSpecType($event, 'specTypeNew')">
        <a class="button is-success">
          <span>Choose new spec</span>
        </a>
      </b-upload>
      <span class="file-name" v-if="fileNew">
        {{ fileNew.name }}
        <b-tag :type="[{'is-danger': specTypeNew === 'Unknown'},
                        {'is-success': specTypeNew !== 'Unknown'}]">
          {{ specTypeNew }}
        </b-tag>
      </span>
    </b-field>
    <b-field label="Comparison mode">
    </b-field>
    <b-field>
      <b-radio-button v-model="comparisonMode" native-value="line-by-line" type="is-success">
        <span>line-by-line</span>
      </b-radio-button>
      <b-radio-button v-model="comparisonMode" native-value="side-by-side" type="is-success">
        <span>side-by-side</span>
      </b-radio-button>
    </b-field>
    <b-tooltip label="RRC Protocol only" position="is-right" type="is-info">
      <button class="button is-success" v-on:click="diff()"
              :disabled="!fileOld || !fileNew || specTypeOld !== 'RRC Protocol' ||
                         specTypeNew !== 'RRC Protocol'">
        Diff
      </button>
    </b-tooltip>
    <b-loading :active.sync="isWorking" :is-full-page="true"></b-loading>
  </div>
</template>

<script>
  import { writeFileSync } from 'fs'
  import { parse } from 'path'
  import { ipcRenderer, remote, shell } from 'electron'

  export default {
    data () {
      return {
        fileOld: null,
        fileNew: null,
        specTypeOld: 'Unknown',
        specTypeNew: 'Unknown',
        comparisonMode: 'line-by-line',
        isWorking: false
      }
    },
    methods: {
      checkSpecType: function (file, fileKey) {
        // File object: https://developer.mozilla.org/en-US/docs/Web/API/File
        // Electron adds `path` attribute: https://tinydew4.github.io/electron-ko/docs/api/file-object/
        let fs = require('fs')
        let content = fs.readFileSync(file.path, 'utf8')
        let indexRrc = content.indexOf('Radio Resource Control')
        let indexAp = content.indexOf('Application Protocol')
        if (indexRrc === -1 && indexAp === -1) {
          this[fileKey] = 'Unknown'
          return
        }
        if (indexRrc >= 0 && (indexAp === -1 || (indexAp >= 0 && indexRrc < indexAp))) {
          this[fileKey] = 'RRC Protocol'
        }
        if (indexAp >= 0 && (indexRrc === -1 || (indexRrc >= 0 && indexAp < indexRrc))) {
          this[fileKey] = 'Application Protocol'
        }
      },
      diff () {
        this.isWorking = true
        ipcRenderer.send('diff-request', JSON.stringify({
          fileOld: this.fileOld.path,
          fileNew: this.fileNew.path,
          comparisonMode: this.comparisonMode
        }))
      }
    },
    mounted () {
      ipcRenderer.removeAllListeners('diff-response')
      ipcRenderer.on('diff-response', (event, data) => {
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
          let savePath = remote.dialog.showSaveDialog({
            defaultPath: `${parse(this.fileOld.path).base}_${parse(this.fileNew.path).base}_${this.comparisonMode}.html`
          })
          if (savePath) {
            try {
              writeFileSync(savePath, result.render)
              this.$snackbar.open({
                message: 'Diff success',
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
        }
        this.isWorking = false
      })
    }
  }
</script>

<style>
</style>
