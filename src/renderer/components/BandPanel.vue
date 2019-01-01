<template>
  <div class="panel">
    <div class="panel-heading">
      <span v-if="!isEditing" v-on:click="isEditing = true">
        {{ ratName }}
      </span>
      <b-input v-model="ratName" v-if="isEditing" v-on:blur="onRatNameChange"></b-input>
    </div>
    <div class="panel-block">
      <div class="columns">
        <div class="column">
          <frequency-table heading="Downlink" v-on:data-changed="onDataChange($event, 'downlink')">
          </frequency-table>
        </div>
        <div class="column">
          <frequency-table heading="Uplink" v-on:data-changed="onDataChange($event, 'uplink')">
          </frequency-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import FrequencyTable from './FrequencyTable'

  export default {
    components: { FrequencyTable },
    props: {
      ratName: {
        type: String,
        default: 'RAT'
      }
    },
    data () {
      return {
        isEditing: false,
        downlink: [],
        uplink: []
      }
    },
    methods: {
      emitDataChange: function () {
        this.$emit('data-changed', {
          ratName: this.ratName,
          downlink: this.downlink,
          uplink: this.uplink
        })
      },
      onRatNameChange: function () {
        this.isEditing = false
        this.emitDataChange()
      },
      onDataChange: function (data, keyName) {
        this[keyName] = data
        this.emitDataChange()
      }
    }
  }
</script>

<style>
</style>
