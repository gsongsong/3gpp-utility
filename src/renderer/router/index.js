import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: require('@/components/Home').default
    },
    {
      path: '/meeting',
      name: 'meeting',
      component: require('@/components/Meeting').default
    },
    {
      path: '/formatter',
      name: 'formatter',
      component: require('@/components/Formatter').default
    },
    {
      path: '/diff',
      name: 'diff',
      component: require('@/components/Diff').default
    },
    {
      path: '/idc',
      name: 'idc',
      component: require('@/components/Idc').default
    },
    {
      path: '/worker',
      name: 'worker',
      component: require('@/components/Worker').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
