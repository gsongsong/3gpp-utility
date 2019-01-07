<template>
  <div class="card">
    <div class="card-header">
      <p class="card-header-title">
        {{ heading }}
      </p>
    </div>
    <div class="card-contet">
      <b-table class="table is-fullwidth" :data="data" striped narrowed hoverable>
        <template slot-scope="props">
          <b-table-column field="name" label="Name">
            {{ props.row.name ? props.row.name : '' }}
            <b-input v-if="!props.row.name" v-model="nameTemp"></b-input>
          </b-table-column>
          <b-table-column field="fLow" label="Freq Low" centered="">
            {{ props.row.fLow ? props.row.fLow : '' }}
            <b-input type="number" v-if="!props.row.fLow" v-model="fLowTemp"></b-input>
          </b-table-column>
          <b-table-column field="fHigh" label="Freq High" centered>
            {{ props.row.fHigh ? props.row.fHigh : '' }}
            <b-input type="number" v-if="!props.row.fHigh" v-model="fHighTemp"></b-input>
          </b-table-column>
          <b-table-column field="button">
            <button class="button is-danger" v-if="props.row.name" v-on:click="remove(props.row.id)">🞬</button>
            <button class="button is-success" v-if="!props.row.name" v-on:click="add">✚</button>
          </b-table-column>
        </template>
        <template slot="footer">
          <div class="has-text-right has-text-grey">
            Frequency in MHz
          </div>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      heading: {
        type: String,
        default: 'Frequency Table'
      }
    },
    data () {
      return {
        data: [
          {}
        ],
        nameTemp: null,
        fLowTemp: null,
        fHighTemp: null
      }
    },
    methods: {
      emitDataChanged: function () {
        this.$emit('data-changed', this.data.slice(0, this.data.length - 1))
      },
      add: function () {
        if (this.nameTemp && this.fLowTemp && this.fHighTemp) {
          this.data.splice(this.data.length - 1, 0, {
            id: this.data.length - 1,
            name: this.nameTemp,
            fLow: Number(this.fLowTemp),
            fHigh: Number(this.fHighTemp)
          })
          this.nameTemp = null
          this.fLowTemp = null
          this.fHighTemp = null
          this.emitDataChanged()
        }
      },
      remove: function (id) {
        let index = this.data.findIndex((row) => {
          return row.id === id
        })
        this.data.splice(index, 1)
        this.emitDataChanged()
      }
    }
  }
</script>

<style>
</style>
