<template>
  <div class="activity-management">
    <!-- 顶部导航栏 -->
    <header class="management-header">
      <div class="header-content">
        <div class="logo-section">
          <img src="@/assets/logo.png" alt="觅活 Meetup" class="logo">
          <span class="app-name">觅活</span>
        </div>
        <nav class="nav-links">
          <router-link to="/mycenter" class="nav-link">返回个人中心</router-link>
          <router-link to="/recommendations" class="nav-link">返回首页</router-link>
        </nav>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="management-main">
      <div class="container">
        <!-- 活动概览 -->
        <div class="activity-overview" v-if="activityDetails">
          <div class="overview-container">
            <!-- 活动信息（左侧） -->
            <div class="overview-content">
              <h1 class="activity-title">{{ activityDetails.title }}</h1>
              <div class="activity-meta">
                <div class="meta-item">
                  <span class="meta-icon">👁️</span>
                  <span class="meta-text">浏览量: {{ activityDetails.views_count || activityDetails.views || 0 }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">👥</span>
                  <span class="meta-text">报名人数: {{ activityDetails.current_participants || 0 }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span class="meta-text">开始时间: {{ formatDateTime(activityDetails.start_time) }}</span>
                </div>
                <div class="meta-item" v-if="!canEdit">
                  <span class="meta-warning">⚠️ 活动开始前2天内不可修改</span>
                </div>
              </div>
            </div>
            
            <!-- 活动封面（右侧） -->
            <div class="overview-cover">
              <img 
                v-if="activityDetails.cover_image" 
                :src="activityDetails.cover_image" 
                :alt="activityDetails.title"
                class="cover-image"
              >
              <div v-else class="cover-placeholder">
                <span class="placeholder-icon">🎯</span>
                <span class="placeholder-text">活动封面</span>
              </div>
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
            @click="activeTab = tab.id"
          >
            <span class="tab-icon" :class="tab.icon"></span>
            {{ tab.name }}
          </button>
        </div>

        <!-- 报名者管理选项卡 -->
        <div v-if="activeTab === 'participants'" class="tab-content">
          <div class="participants-section">
            <div class="section-header">
              <h2>报名者管理</h2>
              <div class="section-actions">
                <button 
                  class="btn-outline" 
                  @click="approveAllPending"
                  :disabled="registrationStatuses.pending.length === 0"
                >
                  <span class="btn-icon">✓</span>
                  批准全部待审核
                </button>
              </div>
            </div>

            <div v-if="loading.participants" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载报名者信息中...</p>
            </div>

            <div v-else-if="participants.length === 0" class="empty-state">
              <div class="empty-icon">👥</div>
              <p>暂无报名者</p>
            </div>

            <div v-else class="participants-list">
              <!-- 状态分类选项卡 -->
              <div class="status-tabs">
                <button 
                  class="status-tab"
                  :class="{ active: selectedStatusFilter === '' }"
                  @click="selectedStatusFilter = ''"
                >
                  <span class="tab-label">全部</span>
                  <span class="tab-count">{{ participants.length }}</span>
                </button>
                <button 
                  v-for="status in ['pending', 'approved', 'rejected', 'cancelled']"
                  :key="status"
                  class="status-tab"
                  :class="{ active: selectedStatusFilter === status, [getStatusClass(status)]: true }"
                  @click="selectedStatusFilter = status"
                >
                  <span class="tab-label">{{ getStatusLabel(status) }}</span>
                  <span class="tab-count">{{ registrationStatuses[status].length }}</span>
                </button>
              </div>

              <!-- 状态分组显示 -->
              <div class="participants-by-status">
                <!-- 显示全部或筛选后的参与者 -->
                <div v-if="!selectedStatusFilter" class="status-group">
                  <div v-for="status in ['pending', 'approved', 'rejected', 'cancelled']" :key="status">
                    <div v-if="registrationStatuses[status].length > 0" class="status-section">
                      <div class="status-section-header">
                        <h3>{{ getStatusLabel(status) }} ({{ registrationStatuses[status].length }})</h3>
                      </div>
                      <div class="participants-table">
                        <div class="table-header">
                          <div class="table-cell">用户名</div>
                          <div class="table-cell">报名时间</div>
                          <div v-if="status === 'pending'" class="table-cell">操作</div>
                        </div>
                        <div 
                          v-for="participant in registrationStatuses[status]" 
                          :key="participant.id"
                          class="table-row"
                        >
                          <div class="table-cell" data-label="用户名">
                            {{ participant.participant?.username || '未知用户' }}
                          </div>
                          <div class="table-cell" data-label="报名时间">
                            {{ formatDateTime(participant.registration_time || participant.created_at) }}
                          </div>
                          <div v-if="status === 'pending'" class="table-cell" data-label="操作">
                            <div class="action-buttons">
                              <button 
                                class="btn-action approve"
                                @click="reviewRegistration(participant.id, 'approved', '批准')"
                                :disabled="isReviewingRegistration"
                              >
                                批准
                              </button>
                              <button 
                                class="btn-action reject"
                                @click="reviewRegistration(participant.id, 'rejected', '拒绝')"
                                :disabled="isReviewingRegistration"
                              >
                                拒绝
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 显示筛选后的参与者 -->
                <div v-if="selectedStatusFilter" class="status-group">
                  <div class="status-section">
                    <div class="status-section-header">
                      <h3>{{ getStatusLabel(selectedStatusFilter) }} ({{ registrationStatuses[selectedStatusFilter].length }})</h3>
                    </div>
                    <div class="participants-table">
                      <div class="table-header">
                        <div class="table-cell">用户名</div>
                        <div class="table-cell">报名时间</div>
                        <div v-if="selectedStatusFilter === 'pending'" class="table-cell">操作</div>
                      </div>
                      <div 
                        v-for="participant in registrationStatuses[selectedStatusFilter]" 
                        :key="participant.id"
                        class="table-row"
                      >
                        <div class="table-cell" data-label="用户名">
                          {{ participant.participant?.username || '未知用户' }}
                        </div>
                        <div class="table-cell" data-label="报名时间">
                          {{ formatDateTime(participant.registration_time || participant.created_at) }}
                        </div>
                        <div v-if="selectedStatusFilter === 'pending'" class="table-cell" data-label="操作">
                          <div class="action-buttons">
                            <button 
                              class="btn-action approve"
                              @click="reviewRegistration(participant.id, 'approved', '批准')"
                              :disabled="isReviewingRegistration"
                            >
                              批准
                            </button>
                            <button 
                              class="btn-action reject"
                              @click="reviewRegistration(participant.id, 'rejected', '拒绝')"
                              :disabled="isReviewingRegistration"
                            >
                              拒绝
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 活动信息编辑选项卡 -->
        <div v-if="activeTab === 'edit'" class="tab-content">
          <div class="edit-section">
            <div class="section-header">
              <h2>活动信息编辑</h2>
              <div class="edit-status" v-if="!canEdit">
                <span class="status-warning">⚠️ 当前无法修改活动信息</span>
                <p class="status-desc">活动开始前2天内不允许修改信息</p>
              </div>
            </div>

            <div v-if="loading.details" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载活动信息中...</p>
            </div>

            <div v-else class="edit-container">
              <!-- 编辑表单 -->
              <form @submit.prevent="saveActivity" class="edit-form">
              <!-- 基本信息部分 -->
              <div class="form-section">
                <div class="section-title">基本信息</div>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label class="form-label">活动标题</label>
                    <input 
                      v-model="editForm.title" 
                      type="text" 
                      class="form-input"
                      :class="{ 'form-input-error': fieldErrors.title }"
                      :readonly="!canEdit"
                      placeholder="请输入活动标题"
                      @blur="validateField('title')"
                    >
                    <div v-if="fieldErrors.title" class="error-message">{{ fieldErrors.title }}</div>
                  </div>

                  <div class="form-group full-width">
                    <label class="form-label">活动描述</label>
                    <textarea 
                      v-model="editForm.description" 
                      class="form-textarea"
                      :class="{ 'form-input-error': fieldErrors.description }"
                      :readonly="!canEdit"
                      placeholder="请输入活动详细描述"
                      rows="4"
                      @blur="validateField('description')"
                    ></textarea>
                    <div v-if="fieldErrors.description" class="error-message">{{ fieldErrors.description }}</div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">开始时间</label>
                    <input 
                      v-model="editForm.start_time" 
                      type="datetime-local" 
                      class="form-input"
                      :class="{ 'form-input-error': fieldErrors.start_time }"
                      :readonly="!canEdit"
                      @blur="validateField('start_time')"
                    >
                    <div v-if="fieldErrors.start_time" class="error-message">{{ fieldErrors.start_time }}</div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">结束时间</label>
                    <input 
                      v-model="editForm.end_time" 
                      type="datetime-local" 
                      class="form-input"
                      :class="{ 'form-input-error': fieldErrors.end_time }"
                      :readonly="!canEdit"
                      @blur="validateField('end_time')"
                    >
                    <div v-if="fieldErrors.end_time" class="error-message">{{ fieldErrors.end_time }}</div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">活动地点</label>
                    <input 
                      v-model="editForm.location" 
                      type="text" 
                      class="form-input"
                      :readonly="!canEdit"
                      placeholder="请输入活动地点"
                      @blur="validateField('location')"
                    >
                    <div v-if="fieldErrors.location" class="error-message">{{ fieldErrors.location }}</div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">最大参与人数</label>
                    <input 
                      v-model="editForm.max_participants" 
                      type="number" 
                      class="form-input"
                      :readonly="!canEdit"
                      placeholder="0表示不限人数"
                      min="0"
                    >
                  </div>
                </div>
              </div>

              <!-- 参与收获部分 -->
              <div class="form-section">
                <div class="section-title">参与收获</div>
                <div class="form-group full-width">
                  <label class="form-label">选择收获类型（可多选）</label>
                  <div class="checkbox-group">
                    <label v-for="option in benefitsOptions" :key="option.value" class="checkbox-label">
                      <input 
                        v-model="editForm.benefits.benefit"
                        type="checkbox"
                        :value="option.value"
                        class="checkbox-input"
                        :disabled="!canEdit"
                      >
                      <span class="checkbox-text">{{ option.label }}</span>
                    </label>
                  </div>
                </div>
                <div class="form-group full-width">
                  <label class="form-label">收获详情描述</label>
                  <textarea 
                    v-model="editForm.benefits.details" 
                    class="form-textarea"
                    :readonly="!canEdit"
                    placeholder="请详细说明参与活动的收获，例如：可获得志愿时10小时、综测加分2分、技能提升等"
                    rows="3"
                  ></textarea>
                  <div class="char-count">{{ (editForm.benefits.details || '').length }}/200</div>
                </div>
              </div>

              <!-- 招募信息部分 -->
              <div class="form-section">
                <div class="section-title">招募信息</div>
                <div class="form-group">
                  <label class="form-label">面向人群（可多选）</label>
                  <div class="checkbox-group">
                    <label v-for="option in audienceOptions" :key="option.value" class="checkbox-label">
                      <input 
                        v-model="editForm.target_audience.Targeted_people"
                        type="checkbox"
                        :value="option.value"
                        class="checkbox-input"
                        :disabled="!canEdit"
                      >
                      <span class="checkbox-text">{{ option.label }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- 活动分类部分 -->
              <div class="form-section">
                <div class="section-title">活动分类</div>
                <div class="form-group">
                  <label class="form-label">活动类型（可多选）</label>
                  <div class="checkbox-group">
                    <label v-for="option in activityClassOptions" :key="option.value" class="checkbox-label">
                      <input 
                        v-model="editForm.target_audience.Activity_class"
                        type="checkbox"
                        :value="option.value"
                        class="checkbox-input"
                        :disabled="!canEdit"
                      >
                      <span class="checkbox-text">{{ option.label }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="form-actions" v-if="canEdit">
                <button 
                  type="button" 
                  class="btn-cancel"
                  @click="cancelEdit"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  class="btn-save"
                  :disabled="isSaving || !isFormValid"
                >
                  {{ isSaving ? '保存中...' : '保存修改' }}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>

        <!-- 数据统计选项卡 -->
        <div v-if="activeTab === 'stats'" class="tab-content">
          <div class="stats-section">
            <h2>活动数据统计</h2>
            
            <div v-if="loading.stats" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载统计数据中...</p>
            </div>

            <div v-else class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">👁️</div>
                <div class="stat-content">
                  <div class="stat-number">{{ activityStats.views || 0 }}</div>
                  <div class="stat-label">总浏览量</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                  <div class="stat-number">{{ activityStats.current_participants || 0 }}</div>
                  <div class="stat-label">报名人数</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                  <div class="stat-number">{{ (activityStats.views > 0 ? ((activityStats.current_participants / activityStats.views) * 100).toFixed(1) : 0) }}%</div>
                  <div class="stat-label">转化率</div>
                </div>
              </div>
            </div>

            <div class="stats-details" v-if="activityStats">
              <h3>详细数据</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">创建时间:</span>
                  <span class="detail-value">{{ formatDateTime(activityStats.created_at) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">最后更新:</span>
                  <span class="detail-value">{{ formatDateTime(activityStats.updated_at) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">活动状态:</span>
                  <span class="detail-value">{{ getActivityStatus() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { activityAPI, API_BASE_URL } from '@/services/api'

// 简单的消息提示函数，使用弹窗弹出并显示信息
const showMessage = (message, type = 'info') => {
  console.log(`[${type.toUpperCase()}] ${message}`)
  alert(message)
}

const router = useRouter()
const route = useRoute()
const activityId = route.params.id

const activeTab = ref('participants')
const isSaving = ref(false)
const canEdit = ref(true)

// 加载状态
const loading = reactive({
  details: false,
  participants: false,
  stats: false
})

// 选项卡配置
const tabs = [
  { id: 'participants', name: '报名者管理', icon: 'icon-participants' },
  { id: 'edit', name: '活动信息', icon: 'icon-edit' },
  { id: 'stats', name: '数据统计', icon: 'icon-stats' }
]

// 活动数据
const activityDetails = ref(null)
const participants = ref([])
const activityStats = ref({})

// 报名状态分类（按状态分组显示）
const registrationStatuses = reactive({
  pending: [],      // 待审核
  approved: [],     // 已确认
  rejected: [],     // 已拒绝
  cancelled: []     // 已取消
})

const selectedStatusFilter = ref('')  // 用于筛选显示哪个状态的参与者
const isReviewingRegistration = ref(false)  // 审核中状态标识

// 编辑表单
const editForm = reactive({
  title: '',
  description: '',
  location: '',
  start_time: '',
  end_time: '',
  max_participants: 0,
  tags: [],
  target_audience: {
    Targeted_people: [],
    Activity_class: []
  },
  benefits: {
    benefit: [],
    details: ''  // 收获详情描述
  }
})

// 原始表单数据，用于追踪哪些字段被修改
const originalForm = reactive({
  title: '',
  description: '',
  location: '',
  start_time: '',
  end_time: '',
  max_participants: 0,
  tags: [],
  target_audience: {
    Targeted_people: [],
    Activity_class: []
  },
  benefits: {
    benefit: [],
    details: ''
  }
})

// 选项数据
const benefitsOptions = [
  { value: '综测加分', label: '综测加分' },
  { value: '志愿时', label: '志愿时' },
  { value: '其他', label: '其他' }
]

const audienceOptions = [
  { value: '大一', label: '大一' },
  { value: '大二', label: '大二' },
  { value: '大三', label: '大三' },
  { value: '大四', label: '大四' },
  { value: '研究生', label: '研究生' }
]

const activityClassOptions = [
  { value: '就业创业', label: '就业创业' },
  { value: '学术调研', label: '学术调研' },
  { value: '文体艺术', label: '文体艺术' },
  { value: '志愿服务', label: '志愿服务' },
  { value: '社会实践', label: '社会实践' },
  { value: '校园生活', label: '校园生活' }
]

// 字段错误信息，当表单验证失败时，可以将对应的错误信息赋值给相应的字段
const fieldErrors = reactive({
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
  max_participants: '',
  category: ''
})

// 表单验证规则
const validationRules = {
  title: (value) => {
    if (!value) return '活动标题不能为空'
    if (value.length < 2) return '标题至少2个字符'
    if (value.length > 50) return '标题不能超过50个字符'
    return ''
  },
  description: (value) => {
    if (!value) return '活动描述不能为空'
    if (value.length < 10) return '描述至少10个字符'
    return ''
  },
  start_time: (value) => {
    if (!value) return '开始时间不能为空'
    return ''
  },
  end_time: (value) => {
    if (!value) return '结束时间不能为空'
    return ''
  },
  location: (value) => {
    if (!value) return '活动地点不能为空'
    return ''
  },
  category: (value) => {
    if (!value) return '请选择活动分类'
    return ''
  }
}

// 表单验证
const validateField = (fieldName) => {
  const value = editForm[fieldName]
  const validator = validationRules[fieldName]
  //如果该字段存在验证规则，则执行验证并将结果存储到错误信息对象中
  if (validator) {
    fieldErrors[fieldName] = validator(value)
  }
}

//查看是否有非空信息
const isFormValid = computed(() => {
  return !Object.values(fieldErrors).some(error => error !== '')
})

// 加载活动详情
const loadActivityDetails = async () => {
  loading.details = true
  try {
    const result = await activityAPI.getActivityDetails(activityId)
    console.log('加载活动详情结果:', result)
    
    // 检查响应是否成功
    if (!result || !result.success) {
      console.error('获取活动详情失败:', result?.message || '未知错误')
      alert('获取活动详情失败: ' + (result?.message || '未知错误'))
      return
    }
    
    const data = result.data
    if (!data) {
      console.error('活动详情数据为空')
      alert('活动详情数据为空')
      return
    }
    
    console.log('活动详情原始响应:', data)
    
    const activityData = data.activity || data
    
    if (!activityData) {
      console.error('活动对象为空')
      alert('活动对象为空')
      return
    }
    
    console.log('活动详情数据:', activityData)
    
    activityDetails.value = activityData
    
    // 异步加载活动封面（从静态资源库中探测）
    if (activityDetails.value) {
      await resolveCoverImageIfNeeded(activityDetails.value)
    }
    
    // 字段映射，确保嵌套对象被正确填充
    editForm.title = activityData.title || ''
    editForm.description = activityData.description || ''
    editForm.location = activityData.location || ''
    editForm.max_participants = activityData.max_participants || 0
    
    // 格式化日期时间
    editForm.start_time = activityData.start_time ? formatDateTimeForInput(activityData.start_time) : ''
    editForm.end_time = activityData.end_time ? formatDateTimeForInput(activityData.end_time) : ''
    
    // 处理 tags（数组）
    editForm.tags = Array.isArray(activityData.tags) ? activityData.tags : []
    
    // 处理 target_audience（嵌套对象）
    if (activityData.target_audience) {
      editForm.target_audience.Targeted_people = Array.isArray(activityData.target_audience.Targeted_people) 
        ? activityData.target_audience.Targeted_people 
        : []
      editForm.target_audience.Activity_class = Array.isArray(activityData.target_audience.Activity_class) 
        ? activityData.target_audience.Activity_class 
        : []
    } else {
      editForm.target_audience = {
        Targeted_people: [],
        Activity_class: []
      }
    }
    
    // 处理 benefits（嵌套对象）
    if (activityData.benefits) {
      editForm.benefits.benefit = Array.isArray(activityData.benefits.benefit)
        ? activityData.benefits.benefit
        : []
      editForm.benefits.details = activityData.benefits.details || ''
    } else {
      editForm.benefits = {
        benefit: [],
        details: ''
      }
    }
    
    console.log('编辑表单已填充:', editForm)
    
    // 保存原始值，用于追踪修改
    saveOriginalForm()
  } catch (error) {
    console.error('加载活动详情错误:', error)
    alert('加载活动详情失败，请检查网络连接: ' + error.message)
  } finally {
    loading.details = false
  }
}

// 保存原始表单数据（用于后续比对追踪修改）
const saveOriginalForm = () => {
  originalForm.title = editForm.title
  originalForm.description = editForm.description
  originalForm.location = editForm.location
  originalForm.start_time = editForm.start_time
  originalForm.end_time = editForm.end_time
  originalForm.max_participants = editForm.max_participants
  originalForm.tags = [...editForm.tags]
  originalForm.target_audience.Targeted_people = [...editForm.target_audience.Targeted_people]
  originalForm.target_audience.Activity_class = [...editForm.target_audience.Activity_class]
  originalForm.benefits.benefit = [...editForm.benefits.benefit]
  originalForm.benefits.details = editForm.benefits.details
}

// 比较两个值是否相等（支持数组、对象、基本类型）
const isEqual = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => item === b[index])
  }
  return a === b
}

// 获取修改过的字段，只返回被修改的字段
const getModifiedFields = () => {
  const modified = {}
  
  // 检查基本字段
  if (!isEqual(editForm.title, originalForm.title)) {
    modified.title = editForm.title
  }
  if (!isEqual(editForm.description, originalForm.description)) {
    modified.description = editForm.description
  }
  if (!isEqual(editForm.location, originalForm.location)) {
    modified.location = editForm.location
  }
  if (!isEqual(editForm.start_time, originalForm.start_time)) {
    modified.start_time = editForm.start_time
  }
  if (!isEqual(editForm.end_time, originalForm.end_time)) {
    modified.end_time = editForm.end_time
  }
  if (!isEqual(editForm.max_participants, originalForm.max_participants)) {
    modified.max_participants = editForm.max_participants
  }
  if (!isEqual(editForm.tags, originalForm.tags)) {
    modified.tags = editForm.tags
  }
  
  // 检查 target_audience
  const targetAudienceModified = 
    !isEqual(editForm.target_audience.Targeted_people, originalForm.target_audience.Targeted_people) ||
    !isEqual(editForm.target_audience.Activity_class, originalForm.target_audience.Activity_class)
  
  if (targetAudienceModified) {
    modified.target_audience = {
      Targeted_people: editForm.target_audience.Targeted_people,
      Activity_class: editForm.target_audience.Activity_class
    }
  }
  
  // 检查 benefits
  const benefitsModified = 
    !isEqual(editForm.benefits.benefit, originalForm.benefits.benefit) ||
    !isEqual(editForm.benefits.details, originalForm.benefits.details)
  
  if (benefitsModified) {
    modified.benefits = {
      benefit: editForm.benefits.benefit,
      details: editForm.benefits.details
    }
  }
  
  return modified
}

// 加载参与者列表
const loadParticipants = async () => {
  loading.participants = true
  try {
    const result = await activityAPI.getActivityRegistrations(activityId, 1, 100)
    if (result.success) {
      const registrations = result.data?.items || result.data || []
      participants.value = registrations
      // 分类处理参与者
      categorizeParticipants()
    } else {
      console.error('获取参与者列表失败:', result.message)
      // 不提示错误，使用空列表继续
      participants.value = []
    }
  } catch (error) {
    console.error('加载参与者列表错误:', error)
    participants.value = []
  } finally {
    loading.participants = false
  }
}

// 按状态分类参与者
const categorizeParticipants = () => {
  // 清空所有分类
  Object.keys(registrationStatuses).forEach(status => {
    registrationStatuses[status] = []
  })
  
  // 按状态分类
  participants.value.forEach(participant => {
    const status = participant.status || 'pending'
    if (registrationStatuses[status]) {
      registrationStatuses[status].push(participant)
    }
  })
}

// 获取指定状态的参与者列表（用于模板显示）
const getParticipantsByStatus = (status) => {
  return registrationStatuses[status] || []
}

// 获取状态的中文标签
const getStatusLabel = (status) => {
  const statusLabels = {
    'pending': '待审核',
    'approved': '已确认',
    'rejected': '已拒绝',
    'cancelled': '已取消'
  }
  return statusLabels[status] || status
}

// 获取状态的样式类
const getStatusClass = (status) => {
  const statusClasses = {
    'pending': 'status-pending',
    'approved': 'status-approved',
    'rejected': 'status-rejected',
    'cancelled': 'status-cancelled'
  }
  return statusClasses[status] || ''
}

// 审核报名者（批准或拒绝）
const reviewRegistration = async (registrationId, newStatus, feedback = '') => {
  if (isReviewingRegistration.value) return
  
  isReviewingRegistration.value = true
  try {
    const result = await activityAPI.updateRegistrationStatus(registrationId, newStatus, feedback)
    if (result.success) {
      // 更新本地数据
      const registrationIndex = participants.value.findIndex(p => p.id === registrationId)
      if (registrationIndex !== -1) {
        participants.value[registrationIndex].status = newStatus
        participants.value[registrationIndex].feedback = feedback
      }
      // 重新分类
      categorizeParticipants()
      alert(`操作成功：报名者已${getStatusLabel(newStatus)}`)
    } else {
      alert(`操作失败: ${result.message}`)
    }
  } catch (error) {
    console.error('审核报名者错误:', error)
    alert('审核失败，请稍后重试')
  } finally {
    isReviewingRegistration.value = false
  }
}

// 批量审核（批准所有待审核）
const approveAllPending = async () => {
  const pendingCount = registrationStatuses.pending.length
  if (pendingCount === 0) {
    alert('没有待审核的报名者')
    return
  }
  
  if (!confirm(`确认批准所有 ${pendingCount} 个待审核的报名者吗？`)) {
    return
  }
  
  for (const registration of registrationStatuses.pending) {
    await reviewRegistration(registration.id, 'approved', '批准')
  }
}

// 加载活动统计
const loadActivityStats = async () => {
  loading.stats = true
  try {
    // 使用 getActivityDetails
    const result = await activityAPI.getActivityDetails(activityId)
    if (result.success && result.data) {
      const data = result.data
      
      const statsData = data.stats || {}
      const activityData = data.activity || data
      
      // 提取统计信息并存储
      activityStats.value = {
        views: activityData.views_count || activityData.views || statsData.total_views || 0,
        current_participants: statsData.total_participants || activityData.current_participants || 0,
        completion_rate: statsData.completion_rate || 0,
        average_rating: statsData.average_rating || null,
        created_at: activityData.created_at || '',
        updated_at: activityData.updated_at || ''
      }
      console.log('活动统计数据已加载:', activityStats.value)
      console.log('原始返回数据:', data)
    } else {
      console.error('获取活动统计失败:', result?.message || '未知错误')
      // 设置默认值
      activityStats.value = {
        views: 0,
        current_participants: 0,
        completion_rate: 0,
        average_rating: null,
        created_at: '',
        updated_at: ''
      }
    }
  } catch (error) {
    console.error('加载活动统计错误:', error)
    activityStats.value = {
      views: 0,
      current_participants: 0,
      completion_rate: 0,
      average_rating: null,
      created_at: '',
      updated_at: ''
    }
  } finally {
    loading.stats = false
  }
}

// 检查是否可以编辑
const checkEditable = async () => {
  try {
    const result = await activityAPI.checkActivityEditable(activityId)
    if (result.success) {
      canEdit.value = result.data.can_edit
      if (!result.data.can_edit) {
        activeTab.value = 'participants'
      }
    }
  } catch (error) {
    const msg = error && (error.message || error.toString())
    if (msg && msg.includes('Field required')) {
      console.warn('检查编辑权限接口返回 Field required，已忽略（允许编辑）')
      // 不影响用户正常操作，保守起见允许编辑
      canEdit.value = true
    } else {
      console.error('检查编辑权限错误:', error)
    }
  }
}

// 保存活动修改
const saveActivity = async () => {
  if (isSaving.value || !isFormValid.value) return
  
  isSaving.value = true
  try {
    // 获取只有修改过的字段
    const modifiedFields = getModifiedFields()
    
    // 如果没有修改任何字段，提示用户
    if (Object.keys(modifiedFields).length === 0) {
      showMessage('没有修改任何内容', 'info')
      isSaving.value = false
      return
    }
    
    console.log('修改过的字段:', modifiedFields)
    
    // 更新活动详情（只发送修改过的字段）
    const result = await activityAPI.updateActivityDetails(activityId, modifiedFields)
    
    console.log('活动详情更新结果:', result)
    
    if (result.success) {
      showMessage('活动信息更新成功！', 'success')
      
      // 重新加载活动详情，并更新 originalForm
      await loadActivityDetails()
    } else {
      showMessage(`更新失败: ${result.message}`, 'error')
    }
  } catch (error) {
    console.error('保存活动信息错误:', error)
    showMessage('保存失败，请稍后重试: ' + error.message, 'error')
  } finally {
    isSaving.value = false
  }
}

// 取消编辑
const cancelEdit = () => {
  // 恢复原始数据 - 重新加载来确保嵌套对象正确恢复
  if (activityDetails.value) {
    const data = activityDetails.value
    
    // 基本字段
    editForm.title = data.title || ''
    editForm.description = data.description || ''
    editForm.location = data.location || ''
    editForm.start_time = data.start_time ? formatDateTimeForInput(data.start_time) : ''
    editForm.end_time = data.end_time ? formatDateTimeForInput(data.end_time) : ''
    editForm.max_participants = data.max_participants || 0
    
    // 标签
    editForm.tags = Array.isArray(data.tags) ? [...data.tags] : []
    
    // target_audience
    editForm.target_audience.Targeted_people = Array.isArray(data.target_audience?.Targeted_people) 
      ? [...data.target_audience.Targeted_people] 
      : []
    editForm.target_audience.Activity_class = Array.isArray(data.target_audience?.Activity_class) 
      ? [...data.target_audience.Activity_class] 
      : []
    
    // benefits
    editForm.benefits.benefit = Array.isArray(data.benefits?.benefit)
      ? [...data.benefits.benefit]
      : []
    editForm.benefits.details = data.benefits?.details || ''
    
    // 同步恢复 originalForm（取消所有修改）
    saveOriginalForm()
  }
  
  // 清空错误信息
  Object.keys(fieldErrors).forEach(key => {
    fieldErrors[key] = ''
  })
}



// 工具函数
const formatDate = (dateString) => {
  if (!dateString) return '日期待定'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const formatDateTimeForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

const getGradeText = (grade) => {
  const gradeMap = {
    'freshman': '大一',
    'sophomore': '大二',
    'junior': '大三',
    'senior': '大四',
    'graduate': '研究生'
  }
  return gradeMap[grade] || grade || '未填写'
}

const calculateConversionRate = () => {
  const views = activityStats.value.views || 1
  const participantsCount = participants.value.length
  return ((participantsCount / views) * 100).toFixed(1)
}

const getActivityStatus = () => {
  if (!activityDetails.value) return '未知'
  
  const now = new Date()
  const startTime = new Date(activityDetails.value.start_time)
  const endTime = new Date(activityDetails.value.end_time)
  
  if (now < startTime) return '未开始'
  if (now >= startTime && now <= endTime) return '进行中'
  return '已结束'
}

//图片加载逻辑（与其他界面相似）
const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP']

// 根据活动ID生成候选图片URL列表
const staticCandidatesFor = (item) => {
  const id = item.id
  const candidates = []

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
    img.src = url + (url.includes('?') ? '&' : '?') + 'v=1'
    setTimeout(() => resolve(false), 3000)
  })
}

// 尝试多种候选URL，找到第一个可访问的图片
// 支持两种方式：
// 1. 如果 cover_image 已经是完整的 HTTP URL（如从数据库获取的外部链接），直接使用
// 2. 如果 cover_image 不是 HTTP URL 或为空，则尝试从后端静态资源库探测
const resolveCoverImageIfNeeded = async (item) => {
  if (!item) return
  
  const cur = item.cover_image || ''
  
  // 如果已经有完整的 HTTP URL，直接验证一下是否可访问；如果可访问则直接用
  if (/^https?:\/\//i.test(cur)) {
    try {
      const ok = await checkImage(cur)
      if (ok) {
        console.debug('[resolveCoverImageIfNeeded] 外部 HTTP URL 可访问:', cur)
        return
      } else {
        console.debug('[resolveCoverImageIfNeeded] 外部 HTTP URL 不可访问:', cur, '将尝试静态资源库')
      }
    } catch (e) {
      console.debug('[resolveCoverImageIfNeeded] 外部 HTTP URL 检查异常:', e, '将尝试静态资源库')
    }
  }

  // 如果 cover_image 不是 HTTP URL 或验证失败，尝试从静态资源库探测
  const candidates = staticCandidatesFor(item)
  for (const c of candidates) {
    if (!c) continue
    try {
      const ok = await checkImage(c)
      if (ok) {
        item.cover_image = c
        console.debug('[resolveCoverImageIfNeeded] 从静态资源库找到可用图片:', c)
        return
      }
    } catch (e) {
      // 忽略错误，继续尝试下一个候选
    }
  }
  
  console.debug('[resolveCoverImageIfNeeded] 未找到可用的图片 URL，活动 ID:', item.id)
}

//初始化加载数据（依据点是activityID)
const loadActivityData = async () => {
  try {
    const result = await activityAPI.getActivityDetails(activityId)
    if (result.success) {
      // 处理活动数据
    } else {
      console.error('获取活动详情失败')
      router.push('/mycenter') // 失败时跳回个人中心
    }
  } catch (error) {
    console.error('加载活动数据错误:', error)
    router.push('/mycenter')
  }
}

onMounted(() => {
  // 加载所有必要数据
  loadActivityDetails()
  loadParticipants()
  loadActivityStats()
  loadActivityData()
  // 已移除对后端可编辑身份检查，默认允许编辑（发布者进入该页面）
})
</script>

<style scoped>
.activity-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff9f5 0%, #fff0e6 100%);
}

.management-header {
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

.management-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 活动概览 */
.activity-overview {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.overview-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: center;
}

.overview-cover {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%);
  color: #999;
  gap: 0.5rem;
}

.placeholder-icon {
  font-size: 2.5rem;
}

.placeholder-text {
  font-size: 0.85rem;
  color: #aaa;
}

.overview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.activity-title {
  margin: 0;
  font-size: 28px;
  color: #ff7e5f;
  flex: 1;
  font-weight: 700;
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.meta-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.meta-warning {
  color: #ff6b6b;
  font-weight: 600;
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

/* 通用样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.section-actions {
  display: flex;
  gap: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff6b00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* 参与者列表 */
.participants-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);
  padding: 2rem;
}

.participants-list {
  animation: fadeIn 0.3s ease-in-out;
}

.participants-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: grid;
  grid-template-columns: 2.5fr 2.5fr 1.5fr;
  background: linear-gradient(135deg, #ff6b00 0%, #ff7e5f 100%);
  color: white;
  font-weight: 600;
  padding: 0;
  align-items: center;
}

.table-row {
  display: grid;
  grid-template-columns: 2.5fr 2.5fr 1.5fr;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
  align-items: center;
}

.table-cell {
  padding: 1.2rem 1.5rem;
  text-align: left;
  color: #333;
  font-size: 0.95rem;
}

.table-header .table-cell {
  padding: 1.2rem 1.5rem;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.table-row:hover {
  background: #fafbfc;
  box-shadow: inset 0 0 8px rgba(255, 107, 0, 0.05);
}

.table-row:last-child {
  border-bottom: 1px solid #f0f0f0;
}

/* 编辑表单 */
.edit-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);
  padding: 2rem;
}

.edit-status {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  color: #856404;
}

.status-warning {
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
}

.status-desc {
  margin: 0;
  font-size: 0.9rem;
}

.edit-form {
  margin-top: 2rem;
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

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-input, .form-select, .form-textarea {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #fafafa;
  font-family: inherit;
}

.form-input:read-only, .form-select:disabled, .form-textarea:read-only {
  background: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #ff6b00;
  box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.1);
  background: white;
}

.form-input-error {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.char-count {
  text-align: right;
  font-size: 0.875rem;
  color: #999;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

/* 按钮样式 */
.btn-primary {
  background: #ff6b00;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: #e55a00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  border: 1px solid #ff6b00;
  color: #ff6b00;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-outline:hover:not(:disabled) {
  background: #ff6b00;
  color: white;
}

.btn-outline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-save:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-icon {
  font-size: 1.1rem;
}

/* 统计卡片 */
.stats-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #fff5f5, #fff0e6);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(255, 107, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #ff6b00;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stats-details {
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.stats-details h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-label {
  font-weight: 500;
  color: #666;
}

.detail-value {
  color: #333;
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
  
  .overview-container {
    flex-direction: column;
    align-items: center;
  }
  
  .overview-cover {
    width: 200px;
    height: 200px;
  }
  
  .overview-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .activity-title {
    font-size: 1.5rem;
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
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .table-header, .table-row {
    grid-template-columns: 1fr;
    display: none; /* 移动端隐藏表头，使用数据标签 */
  }
  
  .table-cell {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }
  
  .table-cell::before {
    content: attr(data-label);
    font-weight: 600;
    color: #666;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* 状态分类标签和分组样式 */
.status-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1rem;
}

.status-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-tab:hover {
  border-color: #ff6b00;
  color: #ff6b00;
}

.status-tab.active {
  background: #ff6b00;
  color: white;
  border-color: #ff6b00;
}

.tab-label {
  white-space: nowrap;
}

.tab-count {
  background: rgba(255, 255, 255, 0.3);
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* 按状态分组 */
.participants-by-status {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.status-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.status-section {
  background: #fafbfc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e8e8e8;
  transition: all 0.3s;
}

.status-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.status-section-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

/* 调整表格布局 */
.status-section .table-header {
  grid-template-columns: 2.5fr 2.5fr 1.5fr;
}

.status-section .table-row {
  grid-template-columns: 2.5fr 2.5fr 1.5fr;
}

.participants-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
}

.btn-action {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s;
  white-space: nowrap;
  min-width: 60px;
  text-align: center;
}

.btn-action.approve {
  background: #4caf50;
  color: white;
}

.btn-action.approve:hover {
  background: #45a049;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.btn-action.approve:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-action.reject {
  background: #f44336;
  color: white;
}

.btn-action.reject:hover {
  background: #da190b;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

.btn-action.reject:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 小按钮样式 */
.btn-small {
  padding: 0.4rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #666;
  transition: all 0.3s;
}

.btn-small:hover {
  border-color: #ff6b00;
  color: #ff6b00;
}

/* 状态样式类 */
.status-pending {
  background: #fff3cd;
  border-color: #ffeaa7;
}

.status-approved {
  background: #d4edda;
  border-color: #c3e6cb;
}

.status-rejected {
  background: #f8d7da;
  border-color: #f5c6cb;
}

.status-cancelled {
  background: #e2e3e5;
  border-color: #d3d6d8;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .status-section .table-header,
  .status-section .table-row {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
  }
  
  .status-tabs {
    gap: 0.25rem;
  }
  
  .status-tab {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .tab-count {
    display: none;
  }
}

/* 表单分节样式 */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #eee;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #ff6b00;
  display: inline-block;
}

/* 复选框组样式 */
.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: #f5f5f5;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #ff6b00;
}

.checkbox-text {
  color: #333;
  font-weight: 500;
}



.no-cover-text {
  color: #999;
  margin: 1rem 0;
}

/* 标签样式 */
.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ff6b00;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
  line-height: 1;
}

.tag-remove:hover {
  opacity: 0.8;
}

/* 编辑表单容器 - 支持并排显示 */
.edit-container {
  display: flex;
  gap: 2rem;
  transition: all 0.3s ease;
}

/* 编辑表单主体 */
.edit-form {
  flex: 1;
  min-width: 0;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .edit-container {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .edit-container {
    flex-direction: column;
  }
}
</style>