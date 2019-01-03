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
    <b-tooltip label="RRC Protocol only" position="is-right" type="is-info">
      <button class="button is-success" v-on:click="diff()"
              :disabled="!fileOld || !fileNew || specTypeOld !== 'RRC Protocol' ||
                         specTypeNew !== 'RRC Protocol'">
        Diff
      </button>
    </b-tooltip>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'

  export default {
    data () {
      return {
        fileOld: null,
        fileNew: null,
        specTypeOld: 'Unknown',
        specTypeNew: 'Unknown'
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
        ipcRenderer.send('diff-request', JSON.stringify({
          fileOld: this.fileOld.path,
          fileNew: this.fileNew.path
        }))
      }
    },
    mounted () {
      ipcRenderer.on('diff-response', (event, data) => {
      })
    }
  }
</script>

<style>
</style>
