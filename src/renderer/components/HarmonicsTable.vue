<template>
  <div class="panel">
    <div class="panel-heading">
      {{ heading }}
    </div>
    <div class="panel-block">
      <b-table :columns="columns" :data="data">
        <template slot="empty">
          <section class="section">
            <div class="content has-text-grey has-text-centered">
              <p>Nothing to display</p>
            </div>
          </section>
        </template>
        <template slot="footer">
          <div class="has-text-right">
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
        type: String
      }
    },

    data () {
      return {
        columns: [
          {field: 'order', label: 'Order', centered: true},
          {field: 'interferer', label: 'Interferer'},
          {field: 'fLow', label: 'Freq Low', centered: true},
          {field: 'fHigh', label: 'Freq High', centered: true},
          {field: 'victim', label: 'Victim'}
        ],
        data: [
        ]}
    }
  }
</script>

<style>
</style>
