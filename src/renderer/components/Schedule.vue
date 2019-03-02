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
    <b-loading :active.sync="isWorking" :is-full-page="true" />
  </div>
</template>

<script>
  import 'tui-calendar/dist/tui-calendar.css'
  import { Calendar } from '@toast-ui/vue-calendar'
  import { GetCalendar } from 'third-gen-web-util'

  export default {
    name: 'schedule',
    components: { Calendar },
    data () {
      return {
        calendarList: [
          {
            id: '0',
            name: 'RAN'
          }
        ],
        scheduleList: [
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
        yearMonth: '',
        isWorking: false
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
      this.isWorking = true
      this.$refs.tuiCalendar.invoke('setCalendarColor', '0', {
        color: '#FFFFFF',
        bgColor: '#23D160',
        borderColor: '#23D160'
      })
      GetCalendar('RAN', (err, data) => {
        if (err) {
          this.isWorking = false
          this.$snackbar.open({
            message: 'Failed to retrieve TSG meeting schedule',
            type: 'is-warning',
            position: 'is-bottom-right',
            actionText: 'Dismiss',
            indefinite: true,
            queue: false
          })
          return
        }
        let schedules = []
        for (let key in data) {
          let schedule = {
            id: key,
            calendarId: '0',
            title: data[key].summary,
            category: 'time',
            dueDateClass: '',
            start: data[key].start,
            end: data[key].end
          }
          schedules.push(schedule)
        }
        this.$refs.tuiCalendar.invoke('createSchedules', schedules)
        this.isWorking = false
      })
    }
  }
</script>

<style>
</style>
