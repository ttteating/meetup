import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '@/views/AuthView.vue'
import forgetview from '@/views/forgetview.vue'
import activityoview from '@/views/activityoview.vue'
import activitylview from '@/views/activitylview.vue'
import activitydview from '@/views/activitydview.vue'
import mycenter from '@/views/mycenterview.vue'
import activitymanager from '@/components/myself/activitymanager.vue'
import activityo2view from '@/views/activityo2view.vue'

const routes = [
  {
    path: '/',
    redirect: '/activitylist'
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView
  },
  {
    path: '/forgot-password',
    name: 'forgotpassword',
    component: forgetview
  },
  {
    path: '/activity',
    name: 'Activity',
    component: activityoview
  },
  {
    path: '/activitylist',
    name: 'ActivityList',
    component: activitylview
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetails',
    component: activitydview
  },
  {
    path: '/user/:id',
    name: 'usercenter',
    component: mycenter
  },
  {
    path: '/mycenter',
    redirect: () => {
      const id = localStorage.getItem('user_id')
      return id ? `/user/${id}` : '/auth'
    }
  },
  {
    path:'/activity/:id/manager',
    name:'activitymanager',
    component:activitymanager,
    meta:{requiresAuth:true}
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router