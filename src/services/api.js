//API配置
const API_BASE_URL = 'http://127.0.0.1:8080' //后端地址

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

  // 如果本地存有 token，则自动注入 Authorization 头
  try {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch (e) {
    // ignore localStorage errors in non-browser env
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    // 尝试解析 JSON（有些错误响应也是 JSON）
    let data
    try {
      data = await response.json()
    } catch (e) {
      data = null
    }

    if (!response.ok) {
      // FastAPI 的 validation error 常常返回 { detail: [ ... ] }
      let msg = '请求失败'
      if (data) {
        if (Array.isArray(data.detail)) {
          // 把每个错误项转换为可读字符串
          msg = data.detail.map(d => {
            if (d.msg) return d.msg
            try { return JSON.stringify(d) } catch(e) { return String(d) }
          }).join('; ')
        } else if (typeof data.detail === 'string') {
          msg = data.detail
        } else if (data.message) {
          msg = data.message
        } else {
          msg = JSON.stringify(data)
        }
      }
      throw new Error(msg)
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
      message: error.message || String(error),
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

  // 如果有 token，自动添加 Authorization 头
  try {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      let msg = '请求失败'
      if (data) {
        if (Array.isArray(data.detail)) {
          msg = data.detail.map(d => d.msg || JSON.stringify(d)).join('; ')
        } else if (data.detail) {
          msg = data.detail
        } else if (data.message) {
          msg = data.message
        } else {
          msg = JSON.stringify(data)
        }
      }
      throw new Error(msg)
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
    // 后端登录接口 /auth/login/credential 接受 JSON body (LoginRequest)
    const res = await request('/auth/login/credential', {
      method: 'POST',
      body: credentials
    })

    if (!res.success) return res

    const data = res.data || {}
    const token = data.access_token || data.token || null
    let user = null

    if (token) {
      try { localStorage.setItem('token', token) } catch(e) {}
      try {
        const me = await request('/auth/me', { method: 'GET' })
        if (me.success) user = me.data
      } catch (e) {
        // ignore
      }
    }

    return {
      success: true,
      data: { token, user }
    }
  },
  
  // 注册
  async register(userData) {
    return request('/auth/register', {
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
    return request('/auth/reset-password/verify', {
      method: 'POST',
      body: data
    })
  },

  // 重置密码
  async resetPassword(data) {
    return request('/auth/reset-password', {
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

  // 上传封面图（独立接口，前端可在选择图片后立即上传）
  async uploadCover(formData) {
    // formData should be a FormData with a file field, e.g. fd.append('file', file)
    return requestWithFile('/api/uploads/cover', formData, {
      method: 'POST'
    })
  },

  // 删除已上传的文件（根据上传ID）
  async deleteUpload(uploadId) {
    return request(`/api/uploads/cover/${uploadId}`, {
      method: 'DELETE'
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
    return request(`/auth/me`, {
      method: 'GET'
    })
  },

  // 通过id获取任意用户信息（如果id是当前用户id，则调用/auth/me）
  async getUserById(id) {
    const currentUserId = localStorage.getItem('user_id')
    // 如果是获取当前登录用户，调用/auth/me
    if (id === currentUserId) {
      return request('/auth/me', {
        method: 'GET'
      })
    }
    // 如果是获取其他用户，调用user接口
    return request(`/auth/users/${id}`, {
      method: 'GET'
    })
  },
  
  // 更新用户信息
  async updateUser(userData) {
    return request('/auth/me', {
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

// AI 聊天接口（扣子AI 智能体）
export const aiAPI = {
  // 发送一句话给后端 AI 服务，后端应返回 { success: true, data: { reply: '...' } }
  async chat(message, context = {}) {
    return request('/api/ai/chat', {
      method: 'POST',
      body: { message, context }
    })
  }
}
