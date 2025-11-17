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
    redirect: '/auth'
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
    component: activityoview,
    meta: { requiresAuth: true }
  },
  {
    path: '/recommendations',
    name: 'Recommendations',
    component: recommendationlist,
    meta: { requiresAuth: true }
  },
  {
    path: '/activitylist',
    name: 'ActivityList',
    component: activitylview,
    meta: { requiresAuth: true }
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetails',
    component: activitydview,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:id',
    name: 'usercenter',
    component: mycenter,
    meta: { requiresAuth: true }
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

// 路由守卫 - 检查认证状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isLoggedIn = !!token
  
  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    if (isLoggedIn) {
      // 已登录，允许访问
      next()
    } else {
      // 未登录，重定向到登录页
      alert('请先登录')
      next('/auth')
    }
  } else {
    // 路由不需要认证，正常访问
    next()
  }
})

export default router