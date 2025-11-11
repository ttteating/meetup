export const API_BASE_URL = 'http://127.0.0.1:8080' 

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
    // 支持通过 options.skipAuth 来跳过自动注入 Authorization（默认注入）
    const skipAuth = options.skipAuth === true
    const token = localStorage.getItem('token')
    if (!skipAuth && token) {
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
    // 调试：显示是否设置了 Authorization 头（不打印完整 token）
    try {
      if (config.headers && config.headers.Authorization) {
        console.debug('[api] Authorization header set')
      } else {
        console.debug('[api] No Authorization header')
      }
    } catch (e) {
      // ignore console errors
    }

    const response = await fetch(url, config)
    // 尝试解析 JSON（有些错误响应也是 JSON）
    let data
    try {
      data = await response.json()
    } catch (e) {
      data = null
    }

    // 如果是 401（未授权），统一处理：清理 token 并返回友好信息，便于前端引导登录
    if (response.status === 401) {
      try { localStorage.removeItem('token') } catch(e) {}
      const errMsg = data && (data.detail || data.message) ? (Array.isArray(data.detail) ? data.detail.join('; ') : (data.detail || data.message)) : '令牌验证失败'
      console.warn('[api] Unauthorized response, cleared local token')
      return {
        success: false,
        message: errMsg,
        status: 401
      }
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
    const skipAuth = options.skipAuth === true
    const token = localStorage.getItem('token')
    if (!skipAuth && token) {
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
  // 创建活动
  async createActivity(activityData) {
    return request('/activities/', {
      method: 'POST',
      body: activityData
    })
  },

  // 上传活动封面
async uploadCover(activityId, file) {
  // 创建 FormData 对象
  const formData = new FormData()
  
  // 添加 activity_id 字段
  formData.append('activity_id', activityId)
  
  // 添加文件字段
  formData.append('file', file)
  
  // 使用 requestWithFile 发送请求
  // 如果你的后端上传接口不需要登录，可以传 { skipAuth: true }
  // 否则去掉 skipAuth 让其自动带上本地 token
  return requestWithFile('/uploads/images/activities/cover', formData, {
    method: 'POST',
    // skipAuth: true
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
    return request('/activities/search/', {
      method: 'GET'
    })
  },

  // 获取某个活动的详情
  async getActivityDetails(activity_id) {
    return request(`/activities/${activity_id}/`, {
      method: 'GET'
    })
  },

  // 更新某个活动的信息（支持文件上传）
  async updateActivity(activity_id, formData) {
    return requestWithFile(`/activities/${activity_id}/`, formData, {
      method: 'PUT'
    })
  },

  // 使用 JSON 更新活动字段（例如更新 cover_image 字段）
  async setCoverImage(activity_id, coverImagePath) {
    return request(`/activities/${activity_id}/`, {
      method: 'PUT',
      body: { cover_image: coverImagePath }
    })
  },

  // 删除某个活动
  async deleteActivity(activity_id) {
    return request(`/activities/${activity_id}/`, {
      method: 'DELETE'
    })
  },

  // 搜索活动（对关键字进行编码）
  async searchactivity(keyword) {
    return request(`/activities/search/`, {
      method: 'GET'
    })
  },

  // 按分类获取活动
  async getActivitiesByCategory(category) {
    return request(`/activities/search/`)
  },

  // 报名参加活动
  async joinActivity(activity_id, options = {}) {
    // 后端创建报名接口需要登录与 activity_id，可选 comment、additional_info
    const body = {
      activity_id,
      comment: typeof options.comment === 'string' ? options.comment : undefined,
      additional_info: options.additional_info && typeof options.additional_info === 'object'
        ? options.additional_info
        : undefined
    }
    return request(`/registrations/`, {
      method: 'POST',
      body
    })
  },

  // 取消报名
  async cancelJoin(activity_id) {
    return request(`/api/activities/${activity_id}/cancel`, {
      method: 'POST'
    })
  },

  // 获取我发布的活动
  async getMyActivities() {
    return request('/activities/organizer/my-activities')
  },

  // 获取我报名的活动
  async getJoinedActivities() {
    // 个人报名记录列表（需要登录）
    return request('/registrations/my/', {
      method: 'GET'
    })
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
    // 默认只请求已发布的活动，除非显式传入其他 status
    if (filters.status) {
      queryParams.append('status', filters.status)
    } else {
      queryParams.append('status', 'published')
    }
    if (filters.page) {
      queryParams.append('page', filters.page)
    }
    if (filters.pageSize) {
      queryParams.append('page_size', filters.pageSize)
    }

    const queryString = queryParams.toString()
    // 使用统一的搜索接口 /activities/search/ 并在有查询时附加查询字符串
    const url = queryString ? `/activities/search/?${queryString}` : '/activities/search/'

    return request(url, {
      method: 'GET'
    })
  },

  //检查用户是否已报名活动
  async checkJoinStatus(activityId) {
    // 查询个人报名记录并在前端判断是否包含该活动
    const res = await request(`/registrations/my/`, {
      method: 'GET'
    })
    if (!res.success) return res
    const list = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : [])
    const joined = list.some(r => String(r.activity_id ?? r.activity?.id) === String(activityId))
    return { success: true, data: { joined }, status: res.status }
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
  },

  // 更新活动状态（发布/取消发布等）
  async updateActivityStatus(activityId, status) {
    return request(`/activities/${activityId}/status`, {
      method: 'PATCH',
      body: { status }
    })
  },

  // 发布活动（将状态设置为已发布）
  async publishActivity(activityId) {
    return this.updateActivityStatus(activityId, 'published')
  },

  // 取消发布活动（将状态设置为草稿）
  async unpublishActivity(activityId) {
    return this.updateActivityStatus(activityId, 'draft')
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
