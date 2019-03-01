<template>
  <div>
    <div class="section">
      <b-field grouped>
        <b-field>
          <p class="control">
            <span class="button is-success" @click="move(-1)">&lt;</span>
          </p>
          <span class="button is-static">{{ yearMonth }}</span>
          <p class="control">
            <span class="button is-success" @click="move(1)">&gt;</span>
          </p>
        </b-field>
        <b-field>
          <span class="button is-success" @click="today">Today</span>
        </b-field>
      </b-field>
    </div>
    <calendar
      ref="tuiCalendar"
      style="height: 800px;"
      :calendars="calendarList"
      :schedules="scheduleList"
      :view="view"
      :taskView="taskView"
      :scheduleView="scheduleView"
      :theme="theme"
      :week="week"
      :month="month"
      :timezones="timezones"
      :disableDblClick="disableDblClick"
      :isReadOnly="isReadOnly"
      :template="template"
      :useCreationPopup="useCreationPopup"
      :useDetailPopup="useDetailPopup"
    />
    <div>
    </div>
  </div>
</template>

<script>
  import 'tui-calendar/dist/tui-calendar.css'
  import { Calendar } from '@toast-ui/vue-calendar'

  export default {
    name: 'schedule',
    components: { Calendar },
    data () {
      return {
        calendarList: [
          {
            id: '0',
            name: 'home'
          },
          {
            id: '1',
            name: 'office'
          }
        ],
        scheduleList: [
          {
            id: '1',
            calendarId: '1',
            title: 'my schedule',
            category: 'time',
            dueDateClass: '',
            start: '2018-10-18T22:30:00+09:00',
            end: '2018-10-19T02:30:00+09:00'
          },
          {
            id: '2',
            calendarId: '1',
            title: 'second schedule',
            category: 'time',
            dueDateClass: '',
            start: '2018-10-18T17:30:00+09:00',
            end: '2018-10-19T17:31:00+09:00'
          }
        ],
        view: 'month',
        taskView: false,
        scheduleView: ['time'],
        theme: {
          'month.dayname.height': '30px',
          'month.dayname.borderLeft': '1px solid #ff0000',
          'month.dayname.textAlign': 'center',
          'week.today.color': '#333',
          'week.daygridLeft.width': '100px',
          'week.timegridLeft.width': '100px'
        },
        week: {
          narrowWeekend: true,
          showTimezoneCollapseButton: true,
          timezonesCollapsed: false
        },
        month: {
          visibleWeeksCount: 4,
          startDayOfWeek: 1
        },
        timezones: [{
          timezoneOffset: 540,
          displayLabel: 'GMT+09:00',
          tooltip: 'Seoul'
        }, {
          timezoneOffset: -420,
          displayLabel: 'GMT-08:00',
          tooltip: 'Los Angeles'
        }],
        disableDblClick: true,
        isReadOnly: true,
        template: {
          milestone: function (schedule) {
            return `<span style="color:red;">${schedule.title}</span>`
          },
          milestoneTitle: function () {
            return 'MILESTONE'
          }
        },
        useCreationPopup: true,
        useDetailPopup: false,
        yearMonth: ''
      }
    },
    computed: {
    },
    methods: {
      updateYearMonth () {
        let date = this.$refs.tuiCalendar.invoke('getDate').toDate()
        this.yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      },
      today () {
        this.$refs.tuiCalendar.invoke('today')
        this.updateYearMonth()
      },
      move (deltaMonth) {
        let date = this.$refs.tuiCalendar.invoke('getDate').toDate()
        date.setMonth(date.getMonth() + deltaMonth)
        this.$refs.tuiCalendar.invoke('setDate', date)
        this.updateYearMonth()
      }
    },
    mounted () {
      this.updateYearMonth()
    }
  }
</script>

<style>
</style>
