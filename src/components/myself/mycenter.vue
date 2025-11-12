<template>
  <div class="user-center">
    <!-- 顶部导航栏 -->
    <header class="user-header">
      <div class="header-content">
        <div class="logo-section">
          <img src="@/assets/logo.png" alt="觅活 Meetup" class="logo">
          <span class="app-name">觅活</span>
        </div>
        <nav class="nav-links">
          <router-link to="/" class="nav-link">返回首页</router-link>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </nav>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="user-main">
      <div class="container">
        <!-- 用户概览 -->
        <div class="user-overview">
          <div class="avatar-section">
            <div class="avatar">
              <span>{{ userInitials }}</span>
            </div>
            <div class="user-info">
              <h2 class="username">{{ formData.username || '用户' }}</h2>
              <p class="user-email">{{ formData.email || '暂无邮箱' }}</p>
            </div>
          </div>
          <div class="stats-section">
            <div class="stat-item">
              <div class="stat-number">{{ createdActivities.length ||0}}</div>
              <div class="stat-label">我创建的</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ joinedActivities.length ||0}}</div>
              <div class="stat-label">我的报名</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ viewedActivities.length ||0}}</div>
              <div class="stat-label">历史浏览</div>
            </div>
          </div>
        </div>

        <!-- 选项卡导航 -->
        <div class="tabs-navigation">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="switchTab(tab.id)"
          >
            <span class="tab-icon" :class="tab.icon"></span>
            {{ tab.name }}
          </button>
        </div>

        <!-- 个人信息选项卡 -->
        <div v-if="activeTab === 'profile'" class="tab-content">
          <div class="user-card">
    <div class="card-header">
      <h2>个人信息</h2>
      <div class="action-buttons">
        <button v-if="!isEditing" @click="toggleEditMode" class="btn-edit">编辑</button>
        <button v-if="isEditing" @click="saveUserInfo" :disabled="isSaving" class="btn-save">
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
        <button v-if="isEditing" @click="toggleEditMode" class="btn-cancel">取消</button>
      </div>
    </div>
    <div class="card-body">
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="formData.username"
            type="text"
            class="form-input"
            :class="{ 'form-input-editing': isEditing }"
            :readonly="!isEditing"
          />
          <div v-if="fieldErrors.username" class="error-message">{{ fieldErrors.username }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">手机号</label>
          <input
            v-model="formData.phone"
            type="tel"
            class="form-input"
            :class="{ 'form-input-editing': isEditing }"
            :readonly="!isEditing"
          />
          <div v-if="fieldErrors.phone" class="error-message">{{ fieldErrors.phone }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <input
            v-model="formData.email"
            type="email"
            class="form-input"
            :class="{ 'form-input-editing': isEditing }"
            :readonly="!isEditing"
          />
          <div v-if="fieldErrors.email" class="error-message">{{ fieldErrors.email }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">性别</label>
          <select
            v-model="formData.profile_attributes.gender"
            class="form-select"
            :class="{ 'form-select-editing': isEditing }"
            :disabled="!isEditing"
          >
            <option value="">请选择</option>
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </div>
 <!-- 替换原有的兴趣爱好表单项 -->
<div class="form-group">
  <label class="form-label">兴趣爱好</label>
  <input
    v-if="isEditing"
    v-model="formData.profile_attributes.hobby"
    type="text"
    class="form-input"
    :class="{ 'form-input-editing': isEditing }"
    placeholder="请用逗号分隔多个兴趣爱好"
  />
  <div v-else class="form-input form-input-editing">
    <span v-if="Array.isArray(formData.profile_attributes.hobby)">
      {{ formData.profile_attributes.hobby.join(', ') }}
    </span>
    <span v-else>
      {{ formData.profile_attributes.hobby }}
    </span>
  </div>
</div>
        <div class="form-group">
          <label class="form-label">学院</label>
          <input
            v-model="formData.profile_attributes.college"
            type="text"
            class="form-input"
            :class="{ 'form-input-editing': isEditing }"
            :readonly="!isEditing"
          />
        </div>
        <div class="form-group">
          <label class="form-label">专业</label>
          <input
            v-model="formData.profile_attributes.major"
            type="text"
            class="form-input"
            :class="{ 'form-input-editing': isEditing }"
            :readonly="!isEditing"
          />
        </div>
        <div class="form-group">
          <label class="form-label">年级</label>
          <input
            v-model="formData.profile_attributes.grade"
            type="text"
            class="form-input"
            :class="{ 'form-input-editing': isEditing }"
            :readonly="!isEditing"
            placeholder="例如：2023级"
          />
        </div>
      </div>
    </div>
  </div>
        </div>

        <!-- 我创建的活动选项卡 -->
        <div v-if="activeTab === 'created'" class="tab-content">
          <div class="activities-section">
            <h2 class="section-title">我创建的活动</h2>
            <div class="create-action">
              <router-link to="/activity" class="btn-primary">
                <span class="btn-icon">➕</span>
                创建新活动
              </router-link>
            </div>
            <div v-if="loading.created" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载中...</p>
            </div>
            <div v-else-if="createdActivities.length === 0" class="empty-state">
              <div class="empty-icon">📝</div>
              <p>您还没有创建任何活动</p>
              <router-link to="/activity" class="btn-primary">创建第一个活动</router-link>
            </div>
            <div v-else class="activities-grid">
              <div 
                v-for="activity in createdActivities" 
                :key="activity.id"
                class="activity-card"
              >
                <div class="activity-image">
                  <img :src="activity.image || '/images/default-activity.jpg'" :alt="activity.title">
                  <span class="activity-status created">我创建的</span>
                  <span v-if="activity.status" class="activity-status" :class="activity.status">
                    {{ getStatusText(activity.status) }}
                  </span>
                </div>
                <div class="activity-content">
                  <h3 class="activity-title">{{ activity.title }}</h3>
                  <p class="activity-desc">{{ activity.description }}</p>
                  <div class="activity-meta">
                    <span class="activity-date">📅 {{ formatDate(activity.start_time) }}</span>
                    <span class="activity-location">📍 {{ activity.location || '待定' }}</span>
                    <span class="activity-participants">👥 {{ activity.participant_count || 0 }} 人报名</span>
                  </div>
                  <div class="activity-actions">
                    <button class="btn-outline" @click="viewActivityDetails(activity.id)">查看详情</button>
                    <button class="btn-edit" @click="editActivity(activity.id)">编辑</button>
                    <button class="btn-manage" @click="viewActivityManagement(activity.id)">管理</button>
                    <button class="btn-danger" @click="deleteActivity(activity.id)">删除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 我的报名选项卡 -->
        <div v-if="activeTab === 'joined'" class="tab-content">
          <!-- 我的报名内容保持不变 -->
        </div>

        <!-- 历史浏览选项卡 -->
        <div v-if="activeTab === 'history'" class="tab-content">
          <!-- 历史浏览内容保持不变 -->
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userStore } from '@/stores/userstore'
import { userAPI, activityAPI, API_BASE_URL } from '@/services/api'

const router = useRouter()
const route = useRoute()
const isEditing = ref(false)
const isSaving = ref(false)
const activeTab = ref('created') // 默认显示我创建的活动

// 加载状态
const loading = reactive({
  created: false,
  joined: false,
  favorites: false,
  history: false,
  favoriteOperation: false,
  deleteOperation: false
})

// 选项卡配置 - 添加我创建的活动
const tabs = [
  { id: 'created', name: '我创建的', icon: 'icon-create' },
  { id: 'joined', name: '我的报名', icon: 'icon-join' },
  { id: 'history', name: '历史浏览', icon: 'icon-history' },
  { id: 'profile', name: '个人信息', icon: 'icon-user' }
]

// 表单数据（包含用户的基本信息和扩展信息）
const formData = reactive({
  // 基本信息
  phone: '',
  email: '',
  username: '',
  // profile_attributes中的扩展信息
  profile_attributes: {
    college: '',
    major: '',
    hobby: [],
    gender: '',
    grade: ''
  }
})

// 活动数据 - 添加我创建的活动
const createdActivities = ref([])
const joinedActivities = ref([])
const viewedActivities = ref([])

// 字段错误信息
const fieldErrors = reactive({
  phone: '',
  email: '',
  username: ''
})

// 计算用户首字母（根据用户名的首字母进行生成对应的头像）
const userInitials = computed(() => {
  if (!formData.username) return 'U'
  return formData.username.charAt(0).toUpperCase()
})

// 表单验证规则（主要针对电话号码、邮箱以及用户名）
const validationRules = {
  phone: (value) => {
    if (!value) return '手机号不能为空'
    if (!/^1[3-9]\d{9}$/.test(value)) return '请输入正确的手机号格式'
    return ''
  },
  email: (value) => {
    if (!value) return '邮箱不能为空'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '请输入正确的邮箱格式'
    return ''
  },
  username: (value) => {
    if (!value) return '用户名不能为空'
    if (value.length < 2) return '用户名至少2个字符'
    if (value.length > 20) return '用户名不能超过20个字符'
    return ''
  }
}

// 验证单个字段
const validateField = (fieldName) => {
  if (!isEditing.value) return
  
  const value = formData[fieldName]
  const validator = validationRules[fieldName]
  
  if (validator) {
    fieldErrors[fieldName] = validator(value)
  }
}

// 验证整个表单
const validateForm = () => {
  Object.keys(validationRules).forEach(field => {
    validateField(field)
  })
  
  return !Object.values(fieldErrors).some(error => error !== '')
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const id = route.params.id
    if (!id) {
      console.warn('没有用户ID，无法加载用户信息')
      return
    }

    // 获取用户数据（优先从store获取，否则从API获取）
    let userData = null
    if (userStore.userInfo && userStore.userInfo.id == id) {
      userData = userStore.userInfo
    } else {
      const result = await userAPI.getUserById(id)
      if (!result.success) {
        console.error('获取用户信息失败:', result.message)
        alert('获取用户信息失败')
        router.push('/auth')
        return
      }
      userData = result.data
    }

    // 重置表单数据
    formData.username = userData.username || ''
    formData.email = userData.email || ''
    formData.phone = userData.phone || ''


    // 处理 profile_attributes
    const profileData = userData.profile_attributes
      ? (typeof userData.profile_attributes === 'string' 
          ? JSON.parse(userData.profile_attributes) 
          : userData.profile_attributes)
      : {}

    // 更新 profile_attributes
    formData.profile_attributes = {
      college: profileData.college || '',
      major: profileData.major || '',
      hobby: Array.isArray(profileData.hobby) ? profileData.hobby : [],
      gender: profileData.gender || '',
      grade: profileData.grade || ''
    }

    // 如果年级是"202X级"格式，转换为"大一"等（仅在存在年级字符串时转换）
    const gradeValue = formData.profile_attributes.grade
    if (gradeValue && gradeValue.includes('级')) {
      const gradeYearMatch = gradeValue.match(/(\d{4})级/)
      if (gradeYearMatch) {
        const gradeYear = parseInt(gradeYearMatch[1])
        const currentYear = new Date().getFullYear()
        const yearDiff = currentYear - gradeYear

        // 统一处理研究生情况
        let gradeText
        if (yearDiff >= 4) {
          gradeText = '研究生'
        } else {
          const gradeMap = {
            0: '大一',
            1: '大二',
            2: '大三',
            3: '大四'
          }
          gradeText = gradeMap[yearDiff] || `${yearDiff}年级`
        }
        formData.profile_attributes.grade = gradeText
      }
    }
  } catch (error) {
    console.error('加载用户信息错误:', error)
    alert('加载用户信息失败，请检查网络连接')
  }
}




// 加载我创建的活动
const loadCreatedActivities = async () => {
  loading.created = true
  try {
    // 调用 getMyActivities 时传递分页参数（默认第1页，每页10条）
    const result = await activityAPI.getMyActivities(1, 10)
    if (result.success) {
      // 后端返回结构可能是 { items: [...], total: number } 或直接是数组
      let items = []
      if (result.data && Array.isArray(result.data.items)) {
        items = result.data.items
      } else if (Array.isArray(result.data)) {
        items = result.data
      } else {
        console.error('活动数据格式不符:', result.data)
        items = []
      }
      
      // 规范化活动数据：从 cover_image 映射到 image 字段，用于模板显示
      createdActivities.value = items.map(item => ({
        ...item,
        // 将后端的 cover_image 映射为模板所用的 image 字段
        image: item.cover_image || item.image || ''
      }))
      
      // 异步为每个活动解析和检测真实的封面 URL
      createdActivities.value.forEach(activity => {
        resolveCoverImageIfNeeded(activity)
      })
    } else {
      console.error('获取创建的活动失败:', result.message)
      alert('获取创建的活动失败')
    }
  } catch (error) {
    console.error('加载创建的活动错误:', error)
    alert('加载创建的活动失败，请检查网络连接')
  } finally {
    loading.created = false
  }
}


//当点击了具体报名活动时，自动跳转到相应的活动管理界面
const viewActivityManagement = (activityId) => {
  router.push(`/activity/${activityId}/manager`)
}

// 加载报名活动
const loadJoinedActivities = async () => {
  loading.joined = true
  try {
    const result = await activityAPI.getJoinedActivities()
    if (result.success) {
      joinedActivities.value = result.data
    } else {
      console.error('获取报名活动失败:', result.message)
      alert('获取报名活动失败')
    }
  } catch (error) {
    console.error('加载报名活动错误:', error)
    alert('加载报名活动失败，请检查网络连接')
  } finally {
    loading.joined = false
  }
}

// 加载浏览历史
const loadViewHistory = async () => {
  loading.history = true
  try {
    const result = await activityAPI.getViewHistory()
    if (result.success) {
      viewedActivities.value = result.data
    } else {
      console.error('获取浏览历史失败:', result.message)
      alert('获取浏览历史失败')
    }
  } catch (error) {
    console.error('加载浏览历史错误:', error)
    alert('加载浏览历史失败，请检查网络连接')
  } finally {
    loading.history = false
  }
}

// 切换选项卡
const switchTab = (tabId) => {
  activeTab.value = tabId
  // 根据选项卡加载对应数据
  switch(tabId) {
    case 'created':
      if (createdActivities.value.length === 0) {
        loadCreatedActivities()
      }
      break
    case 'joined':
      if (joinedActivities.value.length === 0) {
        loadJoinedActivities()
      }
      break
    case 'history':
      if (viewedActivities.value.length === 0) {
        loadViewHistory()
      }
      break
  }
}

// 切换编辑模式
const toggleEditMode = () => {
  if (isEditing.value) {
    // 取消编辑，恢复原始数据
    loadUserInfo()
    // 清空错误信息
    Object.keys(fieldErrors).forEach(key => {
      fieldErrors[key] = ''
    })
  }
  isEditing.value = !isEditing.value
}

// 修改 saveUserInfo 函数，正确构建提交数据
const saveUserInfo = async () => {
  if (isSaving.value) return
  
  // 验证表单
  if (!validateForm()) {
    alert('请修正表单中的错误')
    return
  }
  
  isSaving.value = true
  try {
    // 处理兴趣爱好数据
    let hobbies = formData.profile_attributes.hobby
    if (typeof hobbies === 'string') {
      hobbies = hobbies.split(',').map(h => h.trim()).filter(Boolean)
    }

    // 构造要提交的数据
    const submitData = {
      username: formData.username || '',
      email: formData.email || '',
      phone: formData.phone || '',
      profile_attributes: {
        college: formData.profile_attributes.college || '',
        major: formData.profile_attributes.major || '',
        grade: formData.profile_attributes.grade || '',
        gender: formData.profile_attributes.gender || '',
        hobby: Array.isArray(hobbies) ? hobbies : []
      }
    }

    const result = await userAPI.updateUser(submitData)
    if (result.success) {
      // 更新本地存储的用户信息
      userStore.userInfo = { ...result.data }
      isEditing.value = false
      alert('个人信息更新成功！')
    } else {
      alert(`更新失败: ${result.message}`)
    }
  } catch (error) {
    console.error('保存用户信息错误:', error)
    alert('保存失败，请稍后重试')
  } finally {
    isSaving.value = false
  }
}

// 辅助函数：将"大一"、"研究生"等转为"202X级"
function convertGradeToYear(gradeText) {
  // 如果已经是"202X级"格式，直接返回
  if (gradeText && gradeText.includes('级')) {
    return gradeText
  }
  
  // 特殊处理研究生
  if (gradeText === '研究生') {
    const currentYear = new Date().getFullYear()
    return `${currentYear - 1}级` // 研究生通常比本科生晚一年入学
  }
  
  const undergraduateMap = {
    '大一': 1,
    '大二': 2,
    '大三': 3,
    '大四': 4
  }
  
  const yearOffset = undergraduateMap[gradeText]
  if (yearOffset === undefined) {
    // 对于其他情况，使用默认年份偏移
    const currentYear = new Date().getFullYear()
    const targetYear = currentYear - 1 // 默认为最近一年入学
    return `${targetYear}级`
  }

  const currentYear = new Date().getFullYear()
  const targetYear = currentYear - yearOffset + 1
  return `${targetYear}级`
}
// 编辑活动
const editActivity = (activityId) => {
  router.push(`/edit-activity/${activityId}`)
}

// 删除活动
const deleteActivity = async (activityId) => {
  if (!confirm('确定要删除这个活动吗？此操作不可撤销。')) {
    return
  }

  if (loading.deleteOperation) return
  
  loading.deleteOperation = true
  try {
    const result = await activityAPI.deleteActivity(activityId)
    if (result.success) {
      // 从本地列表中移除
      createdActivities.value = createdActivities.value.filter(
        activity => activity.id !== activityId
      )
      alert('活动删除成功')
    } else {
      alert(`删除失败: ${result.message}`)
    }
  } catch (error) {
    console.error('删除活动错误:', error)
    alert('删除失败，请稍后重试')
  } finally {
    loading.deleteOperation = false
  }
}

// 取消报名
const cancelJoin = async (activityId) => {
  if (confirm('确定要取消报名吗？')) {
    try {
      const result = await activityAPI.cancelJoin(activityId)
      if (result.success) {
        // 从本地列表中移除
        joinedActivities.value = joinedActivities.value.filter(
          activity => activity.id !== activityId
        )
        alert('已取消报名')
      } else {
        alert(`取消报名失败: ${result.message}`)
      }
    } catch (error) {
      console.error('取消报名错误:', error)
      alert('取消报名失败，请稍后重试')
    }
  }
}

// 报名活动
const joinActivity = async (activityId) => {
  try {
    const result = await activityAPI.joinActivity(activityId)
    if (result.success) {
      alert('报名成功！')
    } else {
      alert(`报名失败: ${result.message}`)
    }
  } catch (error) {
    console.error('报名活动错误:', error)
    alert('报名失败，请稍后重试')
  }
}


// 从历史记录中移除
const removeFromHistory = async (activityId) => {
  try {
    const result = await activityAPI.removeFromHistory(activityId)
    if (result.success) {
      viewedActivities.value = viewedActivities.value.filter(
        activity => activity.id !== activityId
      )
      alert('已从历史记录中移除')
    } else {
      alert(`移除失败: ${result.message}`)
    }
  } catch (error) {
    console.error('移除历史记录错误:', error)
    alert('移除失败，请稍后重试')
  }
}

// 清空历史记录
const clearHistory = async () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    try {
      const result = await activityAPI.clearViewHistory()
      if (result.success) {
        viewedActivities.value = []
        alert('历史记录已清空')
      } else {
        alert(`清空失败: ${result.message}`)
      }
    } catch (error) {
      console.error('清空历史记录错误:', error)
      alert('清空失败，请稍后重试')
    }
  }
}

// 查看活动详情
const viewActivityDetails = (activityId) => {
  router.push(`/activity/${activityId}`)
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '日期待定'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 格式化浏览时间
const formatViewTime = (viewTime) => {
  if (!viewTime) return ''
  const date = new Date(viewTime)
  return date.toLocaleString('zh-CN')
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'published': '已发布',
    'ongoing': '进行中',
    'completed': '已结束',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// --- 图片解析与探测逻辑（与 activitylist.vue 一致）---
const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP']

// 根据活动ID生成候选图片URL列表
const staticCandidatesFor = (item) => {
  const id = item.id
  const candidates = []

  // 按 activityId 构造常见命名候选（后端以 activityId 命名封面）
  if (id !== undefined && id !== null) {
    // 使用后端的静态路径 TopActivities，尝试多种扩展名
    imageExtensions.forEach(ext => {
      candidates.push(`${API_BASE_URL}/static/img/TopActivities/${id}.${ext}`)
    })
  }

  return candidates
}

// 检查图片URL是否有效
const checkImage = (url) => {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    // 添加缓存破坏参数以避免过期的 404 响应缓存
    img.src = url + (url.includes('?') ? '&' : '?') + 'v=1'
    // 安全超时
    setTimeout(() => resolve(false), 3000)
  })
}

// 尝试多种候选URL，找到第一个可访问的图片并更新 activity.image
const resolveCoverImageIfNeeded = async (item) => {
  // 如果已经是完整可用的 HTTP URL，则不做探测
  if (!item) return
  const cur = item.image || ''
  if (/^https?:\/\//i.test(cur)) return

  const candidates = staticCandidatesFor(item)
  for (const c of candidates) {
    // 跳过重复和空字符串
    if (!c) continue
    try {
      // eslint-disable-next-line no-await-in-loop
      const ok = await checkImage(c)
      if (ok) {
        item.image = c
        return
      }
    } catch (e) {
      // 忽略错误，继续尝试下一个候选
    }
  }
  // 如果都不行，维持占位图（模板会显示 placeholder）
}

// 退出登录
const handleLogout = async () => {
  if (confirm('确定要退出登录吗？')) {
    try {
      await userAPI.logout()
    } catch (error) {
      console.error('退出登录错误:', error)
    } finally {
      userStore.clearUser()
      router.push('/')
    }
  }
}

// 解析兴趣爱好字符串或数组
const parseHobbies = (hobbies) => {
  if (Array.isArray(hobbies)) {
    return hobbies.filter(h => h.trim() !== '');
  }
  if (typeof hobbies === 'string' && hobbies.trim() !== '') {
    return hobbies.split(',').map(h => h.trim()).filter(h => h !== '');
  }
  return [];
}

//组件挂载完成后执行
onMounted(() => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    router.push('/auth')
    return
  }
  
  // 加载用户信息和初始选项卡数据
  loadUserInfo()
  loadCreatedActivities() // 默认加载我创建的活动
})
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff9f5 0%, #fff0e6 100%);
}

.user-header {
  background: white;
  box-shadow: 0 2px 10px rgba(255, 107, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo {
  height: 40px;
  width: auto;
}

.app-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6b00;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
  font-weight: 500;
}

.nav-link:hover {
  color: #ff6b00;
}

.logout-btn {
  background: none;
  border: 1px solid #ff6b00;
  color: #ff6b00;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.logout-btn:hover {
  background: #ff6b00;
  color: white;
}

.user-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 用户概览 */
.user-overview {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b00, #ff8c00);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.user-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  color: #333;
}

.user-email {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.stats-section {
  display: flex;
  gap: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #ff6b00;
  margin-bottom: 0.5rem;
  min-width:2rem;
  text-align: center;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* 选项卡导航 */
.tabs-navigation {
  display: flex;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  overflow: hidden;
}

.tab-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: rgba(255, 107, 0, 0.05);
  color: #ff6b00;
}

.tab-btn.active {
  background: #ff6b00;
  color: white;
}

.tab-icon {
  font-size: 1.2rem;
}

/* 选项卡内容 */
.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 个人信息卡片 */
.user-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #ff6b00, #ff8c00);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn-edit, .btn-save, .btn-cancel {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-edit {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-edit:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-save {
  background: white;
  color: #ff6b00;
}

.btn-save:hover:not(:disabled) {
  background: #fff5f5;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 107, 0, 0.2);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.card-body {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-input, .form-select {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #fafafa;
}

.form-input:read-only, .form-select:disabled {
  background: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.form-input-editing, .form-select-editing {
  background: white;
  border-color: #ff6b00;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #ff6b00;
  box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.1);
}

.form-input.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* 活动部分 */
.activities-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);
  padding: 2rem;
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.btn-primary {
  background: #ff6b00;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #e55a00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
}

.btn-manage {
  background: #ff6b00;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  flex: 1;
}

.btn-manage:hover {
  background: #e55a00;
  transform: translateY(-1px);
}

/* 活动网格布局 */
.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.activity-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  background: white;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.activity-image {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-status {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #28a745;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.favorite-btn:hover, .favorite-btn.active {
  background: #ff6b00;
  color: white;
}

.activity-content {
  padding: 1.5rem;
}

.activity-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #333;
  line-height: 1.3;
}

.activity-desc {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.activity-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid #ff6b00;
  color: #ff6b00;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  flex: 1;
}

.btn-outline:hover {
  background: #ff6b00;
  color: white;
}

.btn-text {
  background: transparent;
  border: none;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
}

.btn-text:hover {
  color: #ff6b00;
  background: rgba(255, 107, 0, 0.05);
}

/* 历史记录列表 */
.history-actions {
  margin-bottom: 1.5rem;
  text-align: right;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: #f9f9f9;
  transition: background 0.3s;
}

.history-item:hover {
  background: #f0f0f0;
}

.history-image {
  width: 100px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.history-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-content {
  flex: 1;
}

.history-content .activity-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.history-content .activity-desc {
  margin-bottom: 0.75rem;
}

.history-content .activity-meta {
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 0;
  gap: 1rem;
}

.view-time {
  color: #999;
  font-size: 0.8rem;
}

.history-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .header-content {
    padding: 0 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .user-overview {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .avatar-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stats-section {
    gap: 2rem;
  }
  
  .tabs-navigation {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1 0 50%;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .activities-grid {
    grid-template-columns: 1fr;
  }
  
  .history-item {
    flex-direction: column;
  }
  
  .history-image {
    width: 100%;
    height: 120px;
  }
  
  .history-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
  
  .nav-links {
    gap: 1rem;
  }
}

.hobby-display {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  min-height: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.hobby-tag-display {
  background: #ff6b00;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.no-hobby {
  color: #999;
  font-style: italic;
}
</style>