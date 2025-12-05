export const API_BASE_URL = 'http://127.0.0.1:8080' 

//通用请求函数
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  // 复制其他 options，但排除已处理的字段
  const { headers, skipAuth, ...otherOptions } = options
  Object.assign(config, otherOptions)

  // 如果本地存有 token，则自动注入 Authorization 头
  try {
    // 支持通过 options.skipAuth 来跳过自动注入 Authorization（默认注入）
    const token = localStorage.getItem('token')
    if (!skipAuth && token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch (e) {
  
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)//将body对象转换为JSON字符串
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

    // 如果是 401（未授权），清除本地 token 并返回特定错误信息
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
  
  // 添加 activity_id 字段（后端静态资源库需要活动id进行命名）
  formData.append('activity_id', activityId)
  
  // 添加文件字段
  formData.append('file', file)
  
  // 使用 requestWithFile 发送请求
  // 如果你的后端上传接口不需要登录，可以传 { skipAuth: true }
  // 否则去掉 skipAuth 让其自动带上本地 token
  return requestWithFile('/uploads/images/activities/cover', formData, {
    method: 'POST',
  })
},


  // 获取活动列表
  async getActivities() {
    return request('/activities/search', {
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
    return request(`/activities/search`, {
      method: 'GET'
    })
  },

  // 按分类获取活动
  async getActivitiesByCategory(category) {
    return request(`/activities/search`)
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

  // 获取我报名的活动（返回当前登录用户的所有报名记录）
  async getJoinedActivities(page = 1, pageSize = 10) {
    const queryParams = new URLSearchParams()
    queryParams.append('page', page)
    queryParams.append('page_size', pageSize)
    const queryString = queryParams.toString()
    return request(`/registrations/my/?${queryString}`, {
      method: 'GET'
    })
  },

  // 取消报名（根据报名ID进行删除）
  async cancelJoin(registrationId) {
    console.log(`[activityAPI.cancelJoin] 开始取消报名，registrationId: ${registrationId}`)
    try {
      const result = await request(`/registrations/${registrationId}/cancel/`, {
        method: 'POST'
      })
      console.log(`[activityAPI.cancelJoin] 响应:`, result)
      return result
    } catch (error) {
      console.error(`[activityAPI.cancelJoin] 请求异常:`, error)
      return {
        success: false,
        message: error.message || '取消报名请求失败'
      }
    }
  },

  // 获取我发布的活动
  async getMyActivities(page = 1, pageSize = 10) {
    // 后端要求 page 和 page_size 作为 query 参数
    const queryParams = new URLSearchParams()
    queryParams.append('page', page)
    queryParams.append('page_size', pageSize)
    const queryString = queryParams.toString()
    return request(`/activities/organizer/my-activities/?${queryString}`, {
      method: 'GET'
    })
  },

  // 获取特定活动的所有报名信息（管理员/组织者使用）
  async getActivityRegistrations(activityId, page = 1, pageSize = 10, status = '') {
    const queryParams = new URLSearchParams()//自动处理特殊字符的URL编码
    queryParams.append('page', page)
    queryParams.append('page_size', pageSize)
    if (status) {
      queryParams.append('status', status)
    }
    const queryString = queryParams.toString()
    return request(`/registrations/activity/${activityId}?${queryString}`, {
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
    // 后端期望的参数名为 'targeted_people'，值为逗号分隔的中文标签
    if (filters.audience && filters.audience.length > 0) {
      queryParams.append('targeted_people', filters.audience.join(','))
    }
    // 后端期望的参数名为 'activity_class'，值为逗号分隔的中文标签
    if (filters.categories && filters.categories.length > 0) {
      queryParams.append('activity_class', filters.categories.join(','))
    }
    if (filters.timeRange) {
      queryParams.append('time_range', filters.timeRange)
    }
    if (filters.sortBy) {
      queryParams.append('sort_by', filters.sortBy)
    }

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
    // 使用统一的搜索接口 /activities/search 并在有查询时附加查询字符串
    const url = queryString ? `/activities/search?${queryString}` : '/activities/search'

    return request(url, {
      method: 'GET'
    })
  },

  //检查用户是否已报名活动
  async checkJoinStatus(activityId, forceRefresh = true) {
    // 添加时间戳参数破坏缓存，确保每次都获取最新数据
    const timestamp = forceRefresh ? `&_t=${Date.now()}` : ''
    const res = await request(`/registrations/my/?${timestamp}`, {
      method: 'GET'
    })
    if (!res.success) return res
    const list = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : [])
    const joined = list.some(r => String(r.activity_id ?? r.activity?.id) === String(activityId))
    console.log(`[checkJoinStatus] activityId: ${activityId}, joined: ${joined}, list count: ${list.length}`)
    return { success: true, data: { joined }, status: res.status }
  },


//获取某活动详情
  async getActivityStats(activityId) {
    return request(`/activities/${activityId}/`, {
      method: 'GET'
    })
  },

 
  //更新活动状态
  async updateActivityStatus(activityId, status) {
    return request(`/activities/${activityId}/status?status=${status}`, {
      method: 'PATCH'
    })
  },

  // 发布活动（将状态设置为已发布）
  async publishActivity(activityId) {
    return this.updateActivityStatus(activityId, 'published')
  },

  // 取消发布活动（将状态设置为草稿）
  async unpublishActivity(activityId) {
    return this.updateActivityStatus(activityId, 'draft')
  },

  // 更新报名状态（审批/拒绝报名等）
  async updateRegistrationStatus(registrationId, status, feedback = '') {
    const body = {
      status,
      feedback
    }
    return request(`/registrations/${registrationId}/status`, {
      method: 'PATCH',
      body
    })
  },

  // 获取推荐活动列表
  async getRecommendedActivities(count = 5, options = {}) {
    // 默认选项
    const defaultOptions = {
      exclude_viewed: true,
      exclude_registered: true,
      exclude_ended: true
    }
    
    const body = {
      count,
      ...defaultOptions,
      ...options
    }
    
    return request('/recommendations/for-me', {
      method: 'POST',
      body
    })
  }
}

//修改活动详情
activityAPI.updateActivityDetails = async function(activity_id, data) {
  return request(`/activities/${activity_id}/`, {
    method: 'PUT',
    body: data
  })
}

// 用户相关 API
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
    let result = await request('/users/me/', {
      method: 'PATCH',
      body: userData
    })
    return result
  },
  
}

// 用户操作日志相关 API
export const userLogsAPI = {
  async getUserLogs(params = {}) {
    const query = new URLSearchParams()
    Object.keys(params || {}).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        query.append(k, params[k])
      }
    })
    const qs = query.toString()
    const url = qs ? `/user-logs?${qs}` : '/user-logs'
    return request(url, { method: 'GET' })
  },

  // 获取当前用户的浏览历史记录 
  async getUserViewHistory(page = 1, pageSize = 10, sortBy = 'created_at') {
    const query = new URLSearchParams()
    query.append('page', page)
    query.append('page_size', pageSize)
    if (sortBy) {
      query.append('sort_by', sortBy)
    }
    const qs = query.toString()
    return request(`/user-logs/my/history?${qs}`, { method: 'GET' })
  },

  async deleteUserLogsBatch(log_ids) {
    const query = new URLSearchParams()
    query.append('log_ids', log_ids)
    return request(`/user-logs?${query.toString()}`, { method: 'DELETE' })
  },

  // 获取单条日志详情
  async getUserLog(log_id) {
    return request(`/user-logs/${log_id}`, { method: 'GET' })
  },

  // 删除单条日志
  async deleteUserLog(log_id) {
    return request(`/user-logs/${log_id}`, { method: 'DELETE' })
  }
}

//调用扣子AI智能体
export const aiAPI = {
  // 调用扣子AI 智能体客服
  async chat(userInput) {
    try {
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        return {
          success: false,
          message: '用户未登录'
        }
      }
      
      return request('/ai/chat', {
        method: 'POST',
        body: {
          user_id: userId,
          user_input: userInput
        }
      })
    } catch (error) {
      console.error('AI chat error:', error)
      return {
        success: false,
        message: error.message || '调用智能体失败'
      }
    }
  }
}
