import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '@/views/AuthView.vue'
import forgetview from '@/views/forgetview.vue'
import activityoview from '@/views/activityoview.vue'
import activitylview from '@/views/activitylview.vue'
import activitydview from '@/views/activitydview.vue'
import mycenter from '@/views/mycenterview.vue'
import activitymanager from '@/components/myself/activitymanager.vue'
import recommendationlist from '@/components/recommendation/recommendationlist.vue'

const routes = [
  {
    path: '/',
    redirect: '/recommendations'
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
    path: '/recommendations',
    name: 'Recommendations',
    component: recommendationlist
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