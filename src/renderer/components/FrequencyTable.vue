<template>
  <div class="card">
    <div class="card-header">
      <p class="card-header-title">{{ heading }}</p>
    </div>
    <div class="card-contet">
      <b-table class="table is-fullwidth" :data="data" striped narrowed hoverable>
        <template slot-scope="props">
          <b-table-column field="name" label="Name">
            <span v-if="props.row.name">{{ props.row.name }}</span>
            <b-input v-if="!props.row.name" v-model="nameTemp"
              @keyup.native.enter="add" size="is-small" />
          </b-table-column>
          <b-table-column field="fLow" label="Freq Low" centered="">
            <span v-if="props.row.fLow">{{ props.row.fLow }}</span>
            <b-input type="number" v-if="!props.row.fLow" v-model="fLowTemp"
              @keyup.native.enter="add" size="is-small" />
          </b-table-column>
          <b-table-column field="fHigh" label="Freq High" centered>
            <span v-if="props.row.fHigh">{{ props.row.fHigh }}</span>
            <b-input type="number" v-if="!props.row.fHigh" v-model="fHighTemp"
              @keyup.native.enter="add" size="is-small" />
          </b-table-column>
          <b-table-column field="button" centered>
            <a class="has-text-danger" v-if="props.row.name"
              @click="remove(props.row.id)">
              <font-awesome-icon icon="times" />
            </a>
            <a class="has-text-success" v-if="!props.row.name" @click="add">
              <font-awesome-icon icon="plus" />
            </a>
          </b-table-column>
        </template>
        <template slot="footer">
          <div class="has-text-right has-text-grey">Frequency in MHz</div>
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
          {} // Hack to render input row
        ],
        nameTemp: '',
        fLowTemp: '',
        fHighTemp: ''
      }
    },
    methods: {
      emitDataChanged () {
        this.$emit('data-change', this.data.slice(0, this.data.length - 1))
      },
      add () {
        if (this.nameTemp && Number(this.fLowTemp) && Number(this.fHighTemp &&
            Number(this.fLowTemp) < Number(this.fHighTemp))) {
          this.data.splice(this.data.length - 1, 0, {
            id: this.data.length - 1,
            name: this.nameTemp,
            fLow: Number(this.fLowTemp),
            fHigh: Number(this.fHighTemp)
          })
          this.nameTemp = ''
          this.fLowTemp = ''
          this.fHighTemp = ''
          this.emitDataChanged()
        }
      },
      remove (id) {
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
