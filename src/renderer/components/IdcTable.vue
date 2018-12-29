<template>
  <div class="panel">
    <div class="panel-heading">
      {{ heading }}
    </div>
    <div class="panel-block">
      <b-table class="table is-fullwidth" :columns="columns" :data="data">
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
      },
      data: {
        type: Array
      }
    },
    data () {
      return {
        columns: [
          {field: 'order', label: 'Order', centered: true},
          {field: 'name', label: 'Name'},
          {field: 'fLow', label: 'Freq Low', centered: true},
          {field: 'fHigh', label: 'Freq High', centered: true},
          {field: 'victim', label: 'Victim'}
        ]}
    }
  }
</script>

<style>
</style>
