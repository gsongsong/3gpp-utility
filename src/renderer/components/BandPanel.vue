<template>
  <div class="panel">
    <div class="panel-heading">
      <span v-if="!isEditingRatName" @click="isEditingRatName = true">
        {{ ratName }}
      </span>
      <b-input v-model="ratName" v-if="isEditingRatName" @blur="onRatNameChange"
        @keyup.native.enter="onRatNameChange" />
    </div>
    <div class="panel-block">
      <div class="columns">
        <div class="column">
          <frequency-table heading="Downlink" @data-change="onDataChange($event, 'downlink')" />
        </div>
        <div class="column">
          <frequency-table heading="Uplink" @data-change="onDataChange($event, 'uplink')" />
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
      ratNameInitial: {
        type: String,
        default: 'RAT Name'
      }
    },
    data () {
      return {
        ratName: '',
        isEditingRatName: false,
        downlink: [],
        uplink: []
      }
    },
    methods: {
      emitDataChange () {
        this.$emit('data-change', {
          ratName: this.ratName,
          downlink: this.downlink,
          uplink: this.uplink
        })
      },
      onRatNameChange () {
        this.isEditingRatName = false
        this.emitDataChange()
      },
      onDataChange (data, keyName) {
        this[keyName] = data
        this.emitDataChange()
      }
    },
    mounted () {
      this.ratName = this.ratNameInitial
    }
  }
</script>

<style>
</style>
