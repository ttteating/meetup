//API配置
const API_BASE_URL = 'http://localhost:8000' //后端地址

//通用请求函数
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.detail || '请求失败')
    }
    
    return {
      success: true,
      data,
      status: response.status
    }
  } catch (error) {
    console.error('API请求错误:', error)
    return {
      success: false,
      message: error.message,
      status: 0
    }
  }
}

//处理文件上传API
async function requestWithFile(endpoint, formData, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    method: 'POST',
    body: formData,
    ...options,
    headers: {
      // 对于文件上传，不设置 Content-Type，让浏览器自动设置
      ...options.headers,
    }
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.detail || '请求失败')
    }
    
    return {
      success: true,
      data,
      status: response.status
    }
  } catch (error) {
    console.error('API请求错误:', error)
    return {
      success: false,
      message: error.message,
      status: 0
    }
  }
}

// 认证相关API
export const authAPI = {
  // 登录
  async login(credentials) {
    return request('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
  },
  
  // 注册
  async register(userData) {
    return request('/api/auth/register', {
      method: 'POST',
      body: userData
    })
  },
  
  // 忘记密码
  async forgotPassword(email) {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email }
    })
  },

//验证身份
  async verifyIdentity(data) {
    return request('/api/auth/verify-identity', {
      method: 'POST',
      body: data
    })
  },

  // 重置密码
  async resetPassword(data) {
    return request('/api/auth/reset-password', {
      method: 'POST',
      body: data
    })
  },
}

// 活动相关 API
export const activityAPI = {
  // 创建活动（支持文件上传）
  async createActivity(formData) {
    return requestWithFile('/api/activities/', formData, {
      method: 'POST'
    })
  },

  // 获取活动列表
  async getActivities() {
    return request('/api/activities/', {
      method: 'GET'
    })
  },

  // 获取某个活动的详情
  async getActivityDetails(activityId) {
    return request(`/api/activities/${activityId}/`, {
      method: 'GET'
    })
  },

  // 更新某个活动的信息（支持文件上传）
  async updateActivity(activityId, formData) {
    return requestWithFile(`/api/activities/${activityId}/`, formData, {
      method: 'PUT'
    })
  },

  // 删除某个活动
  async deleteActivity(activityId) {
    return request(`/api/activities/${activityId}/`, {
      method: 'DELETE'
    })
  },

  // 搜索活动（对关键字进行编码）
  async searchactivity(keyword) {
    return request(`/api/activities/search/?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET'
    })
  },

  // 按分类获取活动
  async getActivitiesByCategory(category) {
    return request(`/api/activities/category/${category}`)
  },

  // 报名参加活动
  async joinActivity(activityId) {
    return request(`/api/activities/${activityId}/join`, {
      method: 'POST'
    })
  },

  // 取消报名
  async cancelJoin(activityId) {
    return request(`/api/activities/${activityId}/cancel`, {
      method: 'POST'
    })
  },

  // 获取我发布的活动
  async getMyActivities() {
    return request('/api/activities/my-activities')
  },

  // 获取我报名的活动
  async getJoinedActivities() {
    return request('/api/activities/joined-activities')
  },

  //带筛选条件的活动列表接口
  async getActivitiesWithFilters(filters = {}) {
    const queryParams = new URLSearchParams()
    
    // 添加筛选参数
    if (filters.keyword) {
      queryParams.append('keyword', filters.keyword)
    }
    if (filters.benefits && filters.benefits.length > 0) {
      queryParams.append('benefits', filters.benefits.join(','))
    }
    if (filters.audience && filters.audience.length > 0) {
      queryParams.append('audience', filters.audience.join(','))
    }
    if (filters.categories && filters.categories.length > 0) {
      queryParams.append('categories', filters.categories.join(','))
    }
    if (filters.timeRange && filters.timeRange.length > 0) {
      queryParams.append('time_range', filters.timeRange.join(','))
    }
    if (filters.sortBy) {
      queryParams.append('sort_by', filters.sortBy)
    }
    if (filters.page) {
      queryParams.append('page', filters.page)
    }
    if (filters.pageSize) {
      queryParams.append('page_size', filters.pageSize)
    }

    const queryString = queryParams.toString()
    const url = queryString ? `/api/activities/?${queryString}` : '/api/activities/'
    
    return request(url, {
      method: 'GET'
    })
  },

  //检查用户是否已报名活动
  async checkJoinStatus(activityId) {
    return request(`/api/activities/${activityId}/join-status`, {
      method: 'GET'
    })
  },

  // 增加活动浏览量
async incrementActivityViews(activityId) {
  return request(`/api/activities/${activityId}/view`, {
    method: 'POST'
  })
},

  // 获取收藏的活动
async getFavoritedActivities() {
    return request('/api/activities/favorites', {
      method: 'GET'
    })
  },

  // 收藏活动
  async favoriteActivity(activityId) {
    return request(`/api/activities/${activityId}/favorite`, {
      method: 'POST'
    })
  },

  // 取消收藏活动
  async unfavoriteActivity(activityId) {
    return request(`/api/activities/${activityId}/unfavorite`, {
      method: 'POST'
    })
  },

  // 获取浏览历史
  async getViewHistory() {
    return request('/api/activities/history', {
      method: 'GET'
    })
  },

  // 清空浏览历史
  async clearViewHistory() {
    return request('/api/activities/history', {
      method: 'DELETE'
    })
  },

  // 从历史记录中移除单个活动
  async removeFromHistory(activityId) {
    return request(`/api/activities/history/${activityId}`, {
      method: 'DELETE'
    })
  },
  // 获取活动参与者列表
  async getActivityParticipants(activityId) {
    return request(`/api/activities/${activityId}/participants`, {
      method: 'GET'
    })
  },

  // 获取活动统计数据（包括浏览量等）
  async getActivityStats(activityId) {
    return request(`/api/activities/${activityId}/stats`, {
      method: 'GET'
    })
  },

  // 检查是否可以修改活动
  async checkActivityEditable(activityId) {
    return request(`/api/activities/${activityId}/check-edit`, {
      method: 'GET'
    })
  },

  // 导出参与者数据
  async exportParticipants(activityId) {
    return request(`/api/activities/${activityId}/export-participants`, {
      method: 'GET'
    })
  }
}

// 在api.js中添加用户相关API
export const userAPI = {
  // 获取当前用户信息
  async getCurrentUser() {
    return request('/api/user/me', {
      method: 'GET'
    })
  },
  
  // 更新用户信息
  async updateUser(userData) {
    return request('/api/user/me', {
      method: 'PUT',
      body: userData
    })
  },
  
  // 检查登录状态
  async checkAuth() {
    return request('/api/auth/check', {
      method: 'GET'
    })
  },
  
  // 退出登录
  async logout() {
    return request('/api/auth/logout', {
      method: 'POST'
    })
  }
}
