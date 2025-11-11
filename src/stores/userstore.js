//此文件用于用户状态管理
import { reactive } from 'vue'
import { userAPI } from '@/services/api'

export const userStore = reactive({
  isLoggedIn: !!localStorage.getItem('token'),
  userInfo: null,
  
  // 设置用户信息（登录成功后调用）
  setUser(userData) {
    this.isLoggedIn = true
    this.userInfo = userData
    try {
      const uid = userData && (userData.id || userData.user_id)
      if (uid !== undefined && uid !== null) {
        localStorage.setItem('user_id', String(uid))
      }
    } catch (e) {}
  },
  
  // 清除用户信息（退出登录时调用）
  clearUser() {
    this.isLoggedIn = false
    this.userInfo = null
    localStorage.removeItem('token')
  },
  
  // 获取当前用户信息
  async fetchUserInfo() {
    if (!this.isLoggedIn) return
    
    try {
      const result = await userAPI.getCurrentUser()
      if (result.success) {
        this.userInfo = result.data
        try {
          const uid = result.data && (result.data.id || result.data.user_id)
          if (uid !== undefined && uid !== null) {
            localStorage.setItem('user_id', String(uid))
          }
        } catch (e) {}
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.clearUser()
    }
  },

  // 初始化用户状态（页面加载时调用）
  async initUser() {
    const token = localStorage.getItem('token')
    if (token) {
      this.isLoggedIn = true
      await this.fetchUserInfo()
    }
  }
})