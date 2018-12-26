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
    <b-field grouped>
      <b-field class="control">
        <b-input v-model="msgIeName" placeholder="Message/IE name" :disabled="specType === 'Unknown'"></b-input>
        <p class="control">
          <button class="button is-success" :disabled="specType === 'Unknown' || !msgIeName">Format message/IE</button>
        </p>
      </b-field>
      <p class="control">
        <button class="button is-success" v-if="specType === 'Application Protocol'">Format all</button>
      </p>
    </b-field>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        file: null,
        specType: 'Unknown',
        msgIeName: null
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
      }
    }
  }
</script>

<style>
</style>
